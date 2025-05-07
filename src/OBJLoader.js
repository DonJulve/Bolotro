export class OBJLoader {
    static async loadOBJ(gl, url) {
        const response = await fetch(url);
        const text = await response.text();
        return this.parseOBJ(gl, text);
    }

    static parseOBJ(gl, text) {
        const lines = text.split('\n');
        const vertices = [];
        const normals = [];
        const texCoords = [];
        const faces = [];
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length === 0) continue;
            
            switch(parts[0]) {
                case 'v': // vértice
                    vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    break;
                case 'vn': // normal
                    normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    break;
                case 'vt': // coordenada de textura
                    texCoords.push(parseFloat(parts[1]), parseFloat(parts[2]));
                    break;
                case 'f': // cara
                    for (let i = 1; i < parts.length; i++) {
                        const indices = parts[i].split('/');
                        faces.push(
                            parseInt(indices[0]) - 1, // índice de vértice
                            indices[1] ? parseInt(indices[1]) - 1 : -1, // índice de textura
                            indices[2] ? parseInt(indices[2]) - 1 : -1  // índice de normal
                        );
                    }
                    break;
            }
        }
        
        // Construir el array de puntos para WebGL
        const pointsArray = [];
        for (let i = 0; i < faces.length; i += 3) {
            const vIdx = faces[i] * 3;
            pointsArray.push(
                vec4(vertices[vIdx], vertices[vIdx+1], vertices[vIdx+2], 1.0
            ));
        }
        
        return pointsArray;
    }
}
