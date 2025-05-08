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
                case 'v': 
                    vertices.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    break;
                case 'vn': 
                    normals.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
                    break;
                case 'vt': 
                    texCoords.push(parseFloat(parts[1]), parseFloat(parts[2]));
                    break;
                case 'f': 
                    const faceVertices = [];
                    for (let i = 1; i < parts.length; i++) {
                        const indices = parts[i].split('/');
                        const vIdx = parseInt(indices[0]) - 1;
                        const vtIdx = indices[1] ? parseInt(indices[1]) - 1 : -1;
                        const vnIdx = indices[2] ? parseInt(indices[2]) - 1 : -1;
                        faceVertices.push({ vIdx, vtIdx, vnIdx });
                    }
                    // Triangula la cara
                    for (let i = 1; i < faceVertices.length - 1; i++) {
                        // Primer triángulo: v0, v1, v2
                        faces.push(
                            faceVertices[0].vIdx, faceVertices[0].vtIdx, faceVertices[0].vnIdx,
                            faceVertices[i].vIdx, faceVertices[i].vtIdx, faceVertices[i].vnIdx,
                            faceVertices[i + 1].vIdx, faceVertices[i + 1].vtIdx, faceVertices[i + 1].vnIdx
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
                vec4(vertices[vIdx], vertices[vIdx + 1], vertices[vIdx + 2], 1.0
            ));
        }
        
        return pointsArray;
    }
}
