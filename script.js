const canvas = document.getElementById('lienzo3D');
const ctx = canvas.getContext('2d');
const CENTRO_X = canvas.width / 2;
const CENTRO_Y = canvas.height / 2;

// PARTE 1: Opción A - Pirámide de base cuadrada (5 vértices, 8 aristas)
const modeloPrimitivaLocal = [
    {x:   0, y:  90, z:   0}, // V0: Cúspide superior
    {x: -70, y: -50, z: -70}, // V1: Base Trasera Izquierda
    {x:  70, y: -50, z: -70}, // V2: Base Trasera Derecha
    {x:  70, y: -50, z:  70}, // V3: Base Frontal Derecha
    {x: -70, y: -50, z:  70}  // V4: Base Frontal Izquierda
];

const aristasPrimitiva = [
    // Base cuadrada inferior
    [1, 2], [2, 3], [3, 4], [4, 1],
    // Aristas laterales hacia la cúspide (V0)
    [0, 1], [0, 2], [0, 3], [0, 4]
];

// RETO: Botón de Auto-Rotación Continua (Yaw)
let autoRotando = false;
let anguloYawAuto = 30;
const btnAutorotate = document.getElementById('btnAutorotate');

btnAutorotate.addEventListener('click', () => {
    autoRotando = !autoRotando;
    if (autoRotando) {
        btnAutorotate.innerText = "⏸ Pausar Auto-Rotación";
        btnAutorotate.classList.add('activo');
        requestAnimationFrame(bucleAutoRotacion);
    } else {
        btnAutorotate.innerText = "▶ Activar Auto-Rotación (Yaw)";
        btnAutorotate.classList.remove('activo');
    }
});

function bucleAutoRotacion() {
    if (!autoRotando) return;
    anguloYawAuto = (anguloYawAuto + 1) % 360;
    document.getElementById('ry').value = anguloYawAuto;
    renderizar();
    requestAnimationFrame(bucleAutoRotacion);
}

function transformarVertice3D(v, params) {
    let { tx, ty, tz, sx, sy, sz, rx, ry, rz, shxy, shxz } = params;
    let radX = rx * Math.PI / 180;
    let radY = ry * Math.PI / 180;
    let radZ = rz * Math.PI / 180;

    // Escalamiento
    let x1 = v.x * sx, y1 = v.y * sy, z1 = v.z * sz;
    // Sesgado
    let x2 = x1 + (shxy * y1) + (shxz * z1), y2 = y1, z2 = z1;
    // Rotación X (Pitch)
    let x3 = x2, y3 = y2 * Math.cos(radX) - z2 * Math.sin(radX), z3 = y2 * Math.sin(radX) + z2 * Math.cos(radX);
    // Rotación Y (Yaw)
    let x4 = x3 * Math.cos(radY) + z3 * Math.sin(radY), y4 = y3, z4 = -x3 * Math.sin(radY) + z3 * Math.cos(radY);
    // Rotación Z (Roll)
    let x5 = x4 * Math.cos(radZ) - y4 * Math.sin(radZ), y5 = x4 * Math.sin(radZ) + y4 * Math.cos(radZ), z5 = z4;
    // Traslación
    return { x: x5 + tx, y: y5 + ty, z: z5 + tz };
}

function proyectar3Da2D(v3d) {
    const distanciaCamara = 500;
    let zAjustado = v3d.z + distanciaCamara;
    if (zAjustado < 1) zAjustado = 1;
    let factorProyeccion = distanciaCamara / zAjustado;

    let x2d = CENTRO_X + (v3d.x * factorProyeccion);
    let y2d = CENTRO_Y - (v3d.y * factorProyeccion);
    return { x: x2d, y: y2d, escala: factorProyeccion };
}

function renderizar() {
    const params = {
        tx: parseFloat(document.getElementById('tx').value),
        ty: parseFloat(document.getElementById('ty').value),
        tz: parseFloat(document.getElementById('tz').value),
        sx: parseFloat(document.getElementById('sx').value),
        sy: parseFloat(document.getElementById('sy').value),
        sz: parseFloat(document.getElementById('sz').value),
        rx: parseFloat(document.getElementById('rx').value),
        ry: parseFloat(document.getElementById('ry').value),
        rz: parseFloat(document.getElementById('rz').value),
        shxy: parseFloat(document.getElementById('shxy').value),
        shxz: parseFloat(document.getElementById('shxz').value)
    };

    if (!autoRotando) anguloYawAuto = params.ry;

    document.getElementById('valTx').innerText = params.tx;
    document.getElementById('valTy').innerText = params.ty;
    document.getElementById('valTz').innerText = params.tz;
    document.getElementById('valSx').innerText = params.sx.toFixed(1);
    document.getElementById('valSy').innerText = params.sy.toFixed(1);
    document.getElementById('valSz').innerText = params.sz.toFixed(1);
    document.getElementById('valRx').innerText = params.rx + '°';
    document.getElementById('valRy').innerText = params.ry + '°';
    document.getElementById('valRz').innerText = params.rz + '°';
    document.getElementById('valShXY').innerText = params.shxy.toFixed(1);
    document.getElementById('valShXZ').innerText = params.shxz.toFixed(1);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ejes de guía
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(CENTRO_X, 0); ctx.lineTo(CENTRO_X, canvas.height);
    ctx.moveTo(0, CENTRO_Y); ctx.lineTo(canvas.width, CENTRO_Y);
    ctx.stroke();

    let verticesTransformados = modeloPrimitivaLocal.map(v => transformarVertice3D(v, params));
    let vertices2D = verticesTransformados.map(proyectar3Da2D);

    // Parte 3: Renderizado con estilo y grosor variable según la escala/profundidad
    for (let arista of aristasPrimitiva) {
        let p1 = vertices2D[arista[0]];
        let p2 = vertices2D[arista[1]];
        
        let gradienteLinea = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradienteLinea.addColorStop(0, '#c084fc');
        gradienteLinea.addColorStop(1, '#f472b6');
        
        ctx.strokeStyle = gradienteLinea;
        ctx.lineWidth = Math.max(1.5, 3.5 * ((p1.escala + p2.escala) / 2));
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }

    // Vértices con brillo neón
    vertices2D.forEach((p, index) => {
        ctx.shadowColor = index === 0 ? '#34d399' : '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = index === 0 ? '#34d399' : '#38bdf8';
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, index === 0 ? 6 : 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

document.querySelectorAll('input[type=range]').forEach(input => {
    input.addEventListener('input', renderizar);
});

renderizar();