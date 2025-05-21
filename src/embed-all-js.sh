#!/bin/bash

set -e

MAIN_JS="main.js"
HTML_FILE="Bolotro.html"
TEMP_SCRIPT="combined.js"
VISITED=()

echo "[+] Resolviendo dependencias desde $MAIN_JS..."

encode_image_to_base64() {
    local image_path=$1
    if [ ! -f "$image_path" ]; then
        echo "console.error('Imagen no encontrada: $image_path');"
        return
    fi
    local mime_type=$(file --mime-type -b "$image_path")
    local base64_data=$(base64 -w 0 "$image_path")
    echo "data:$mime_type;base64,$base64_data"
}

resolve_js() {
    local file=$1
    file=$(realpath "$file")

    for visited_file in "${VISITED[@]}"; do
        if [[ "$visited_file" == "$file" ]]; then return; fi
    done
    VISITED+=("$file")

    while IFS= read -r line; do
        if [[ $line =~ ^[[:space:]]*import.*from[[:space:]]*['\"](.*)['\"] ]]; then
            import_path="${BASH_REMATCH[1]}"
            import_path="${import_path%.js}.js"
            full_path="$(dirname "$file")/$import_path"
            resolve_js "$full_path"
        fi
    done < "$file"

    echo "// BEGIN $file" >> "$TEMP_SCRIPT"

    inside_OBJLoader=false

    # Leer el archivo completo en un array
    mapfile -t lines < "$file"
    skip_until=""
    for ((i=0; i<${#lines[@]}; i++)); do
        line="${lines[i]}"

        # Saltar líneas relacionadas al objeto ya manejado
        if [[ -n "$skip_until" ]]; then
            if [[ "$line" =~ ${skip_until}\.loadTexture\(|this\.objects\.push\(${skip_until}\) ]]; then
                continue
            fi
        fi

        # Reemplazo de texturas a base64
        if [[ $line =~ loadTexture\([^,]+,[[:space:]]*\"(.*\.(png|jpg|jpeg|gif))\"\) ]]; then
            image_path="${BASH_REMATCH[1]}"
            abs_path="$(dirname "$file")/$image_path"
            base64_image=$(encode_image_to_base64 "$abs_path")
            line="${line//$image_path/$base64_image}"
        fi

        # Modelo OBJ
        if [[ $line =~ ([[:alnum:]_]+)\.loadModel\([^,]+,[[:space:]]*\"(.*\.obj)\"\) ]]; then
            instance_name="${BASH_REMATCH[1]}"
            obj_rel="${BASH_REMATCH[2]}"
            abs_obj="$(dirname "$file")/$obj_rel"
            if [ -f "$abs_obj" ]; then
                obj_content=$(sed ':a;N;$!ba;s/`/\\`/g' "$abs_obj")
                echo "// Incrustando modelo OBJ: $obj_rel" >> "$TEMP_SCRIPT"
                echo "const ${instance_name}_obj_text = \`$obj_content\`;" >> "$TEMP_SCRIPT"

                # Buscar loadTexture en las siguientes líneas
                texture_found=false
                for ((j=i+1; j<${#lines[@]}; j++)); do
                    next_line="${lines[j]}"
                    if [[ $next_line =~ ${instance_name}\.loadTexture\([^,]+,[[:space:]]*\"(.*\.(png|jpg|jpeg|gif))\"\) ]]; then
                        texture_path="${BASH_REMATCH[1]}"
                        texture_abs="$(dirname "$file")/$texture_path"
                        texture_base64=$(encode_image_to_base64 "$texture_abs")
                        echo "(async () => {" >> "$TEMP_SCRIPT"
                        echo "  await ${instance_name}.loadModel(gl, ${instance_name}_obj_text);" >> "$TEMP_SCRIPT"
                        echo "  await ${instance_name}.loadTexture(gl, \"$texture_base64\");" >> "$TEMP_SCRIPT"
                        echo "  this.objects.push(${instance_name});" >> "$TEMP_SCRIPT"
                        echo "})();" >> "$TEMP_SCRIPT"
                        skip_until="$instance_name"
                        texture_found=true
                        break
                    fi
                done

                if ! $texture_found; then
                    echo "(async () => {" >> "$TEMP_SCRIPT"
                    echo "  await ${instance_name}.loadModel(gl, ${instance_name}_obj_text);" >> "$TEMP_SCRIPT"
                    echo "  this.objects.push(${instance_name});" >> "$TEMP_SCRIPT"
                    echo "})();" >> "$TEMP_SCRIPT"
                    skip_until="$instance_name"
                fi

                continue
            else
                echo "console.error('Modelo OBJ no encontrado: $abs_obj');" >> "$TEMP_SCRIPT"
            fi
        fi

        # Detectar clase OBJLoader
        if [[ "$line" =~ ^[[:space:]]*class[[:space:]]+OBJLoader[[:space:]]*{ ]]; then
            inside_OBJLoader=true
        fi

        # Marcar parseOBJ como async
        if [[ "$line" =~ ^[[:space:]]*static[[:space:]]+parseOBJ ]]; then
            line=$(echo "$line" | sed -E 's/^[[:space:]]*static[[:space:]]+parseOBJ/static async parseOBJ/')
        fi

        # Reemplazar loadOBJ por parseOBJ
        line=$(echo "$line" | sed 's/OBJLoader\.loadOBJ/OBJLoader.parseOBJ/g')

        # Limpieza de ES6 módulos
        line=$(echo "$line" | sed \
            -e '/^[[:space:]]*import .* from .*/d' \
            -e 's/^[[:space:]]*export default /const /' \
            -e 's/^[[:space:]]*export class /class /' \
            -e 's/^[[:space:]]*export function /function /' \
            -e 's/^[[:space:]]*export const /const /' \
            -e 's/^[[:space:]]*export let /let /' \
            -e 's/^[[:space:]]*export var /var /'
        )

        echo "$line" >> "$TEMP_SCRIPT"
    done

    echo "// END $file" >> "$TEMP_SCRIPT"
}

> "$TEMP_SCRIPT"
resolve_js "$MAIN_JS"

# Asegurar parseOBJ es async
sed -i 's/static parseOBJ/static async parseOBJ/' "$TEMP_SCRIPT"

# Reemplazo del método async loadModel en la clase Pin
PIN_LOADMODEL_REPLACEMENT='async loadModel(gl, url) {
        try {
            // Verifica que las funciones existan
            if (typeof mat4 === "undefined" || typeof translate === "undefined" || 
                typeof rotate === "undefined" || typeof scale === "undefined") {
                throw new Error("Missing matrix functions");
            }

            this.visualPointsArray = await OBJLoader.parseOBJ(gl, url);
            
            // Crea matriz identidad
            this.visualModelMatrix = mat4();

            // 1. Rotación
            const rotation = rotate(this.modelRotation, this.modelRotationAxis);
            this.visualModelMatrix = mult(this.visualModelMatrix, rotation);

            // 2. Escala
            const sx = this.modelScale[0];
            const sy = this.modelScale[1];
            const sz = this.modelScale[2];

            const scaling = mat4();
            scaling[0] = sx;
            scaling[5] = sy;
            scaling[10] = sz;
            scaling[15] = 1.0;

            this.visualModelMatrix = mult(this.visualModelMatrix, scaling);

            // 3. Traslación
            const translation = translate(0, -1, 0);
            this.visualModelMatrix = mult(this.visualModelMatrix, translation);
            
            this.#updatePosition();
            
        } catch (error) {'

echo "[+] Reemplazando método loadModel de la clase Pin..."

# Detecta el método loadModel de la clase Pin y lo reemplaza completamente
awk -v replacement="$PIN_LOADMODEL_REPLACEMENT" '
    BEGIN {
        inside_pin = 0;
        inside_method = 0;
    }
    {
        if ($0 ~ /^class[[:space:]]+Pin[[:space:]]*\{/)
            inside_pin = 1;

        if (inside_pin && $0 ~ /^ *async +loadModel\(.*\)\s*\{/)
            inside_method = 1;

        if (!inside_method)
            print;

        if (inside_method && $0 ~ /^\s*\}/) {
            print replacement;
            inside_method = 0;
        }
    }
' "$TEMP_SCRIPT" > "$TEMP_SCRIPT.tmp" && mv "$TEMP_SCRIPT.tmp" "$TEMP_SCRIPT"

echo "[+] Generando nuevo HTML..."

NEW_HTML="Bolotro.embedded.html"
INSERTED=false
> "$NEW_HTML"

while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*\<script[[:space:]]+type=\"module\"[[:space:]]+src=\"\.\.\/src\/main\.js\".*\</script\>[[:space:]]*$ ]]; then
        continue
    fi

    if [[ "$line" =~ "</body>" && $INSERTED = false ]]; then
        echo "  <script type=\"module\">" >> "$NEW_HTML"
        cat "$TEMP_SCRIPT" >> "$NEW_HTML"
        echo "  </script>" >> "$NEW_HTML"
        INSERTED=true
    fi

    echo "$line" >> "$NEW_HTML"
done < "$HTML_FILE"

rm "$TEMP_SCRIPT"

echo "[✅] Listo. Código embebido en $NEW_HTML"
