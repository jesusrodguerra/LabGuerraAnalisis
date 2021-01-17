const inputAnalisis = document.getElementById('analisis');
const inputEmpresa = document.getElementById('empresa');
const inputFecha = document.getElementById('fecha');
const inputTelefono = document.getElementById('telefono');
const inputResultado = document.getElementById('resultado');
const inputCorreo = document.getElementById('correo');
const formulario = document.getElementById('formulario');
const reportes = document.getElementById('reportes');
const buscador = document.getElementById('buscador');

let DB;

const objetoFiltro = {
    nombreAnalisis: '',
    fechaAnalisis: ''
}

const objeto = {
    analisis: '',
    empresa: '',
    fecha: '',
    telefono: '',
    correo: '',
    resultado: ''
}

window.onload = () => {
    crearDB();
}

class AgregarAnalisis {
    constructor() {
        this.analisis = [];
    }

    agregarNuevo(analisis) {
        this.analisis = [...this.analisis, analisis];
        console.log(this.analisis);

        this.mostrarAnalisis(this.analisis);
    }

    mostrarAnalisis() {

        this.limpiarHtml();

        const objectStore = DB.transaction('analisis').objectStore('analisis');
        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;
            if(cursor) {
                const {analisis, fecha, telefono, correo, resultado, empresa, id} = cursor.value;

                const divContenedor = document.createElement('div');
                divContenedor.classList.add('col-lg-6', 'col-md-6', 'col-sm-12', 'contenedor');
    
                const divAnalisis = document.createElement('h3');
                divAnalisis.textContent = analisis;
    
                const divEmpresa = document.createElement('p');
                divEmpresa.innerHTML = `<strong>Empresa:</strong> ${empresa}`;
    
                const divCorreo = document.createElement('p');
                divCorreo.innerHTML = `<strong>Correo:</strong> ${correo}`;
    
                const divTelefono = document.createElement('p');
                divTelefono.innerHTML = `<strong>Telefono:</strong> ${telefono}`;
    
                const divFecha = document.createElement('p');
                divFecha.innerHTML = `<strong>Fecha:</strong> ${fecha}`;
    
                const divResultado = document.createElement('p');
                divResultado.innerHTML = `<strong>Resultado:</strong> ${resultado}`;
    
                divContenedor.appendChild(divAnalisis);
                divContenedor.appendChild(divEmpresa);
                divContenedor.appendChild(divCorreo);
                divContenedor.appendChild(divTelefono);
                divContenedor.appendChild(divFecha);
                divContenedor.appendChild(divResultado);
    
                reportes.appendChild(divContenedor);

                cursor.continue();
            }
        }

        // analisis.forEach(el => {
        //     const {analisis, fecha, telefono, correo, resultado, empresa, id} = el;

        //     const divContenedor = document.createElement('div');
        //     divContenedor.classList.add('col-lg-6', 'col-md-6', 'col-sm-12', 'contenedor');

        //     const divAnalisis = document.createElement('h3');
        //     divAnalisis.textContent = analisis;

        //     const divEmpresa = document.createElement('p');
        //     divEmpresa.innerHTML = `<strong>Empresa:</strong> ${empresa}`;

        //     const divCorreo = document.createElement('p');
        //     divCorreo.innerHTML = `<strong>Correo:</strong> ${correo}`;

        //     const divTelefono = document.createElement('p');
        //     divTelefono.innerHTML = `<strong>Telefono:</strong> ${telefono}`;

        //     const divFecha = document.createElement('p');
        //     divFecha.innerHTML = `<strong>Fecha:</strong> ${fecha}`;

        //     const divResultado = document.createElement('p');
        //     divResultado.innerHTML = `<strong>Resultado:</strong> ${resultado}`;

        //     divContenedor.appendChild(divAnalisis);
        //     divContenedor.appendChild(divEmpresa);
        //     divContenedor.appendChild(divCorreo);
        //     divContenedor.appendChild(divTelefono);
        //     divContenedor.appendChild(divFecha);
        //     divContenedor.appendChild(divResultado);

        //     reportes.appendChild(divContenedor);

        // })
    }

    limpiarHtml() {
        while(reportes.firstChild) {
            reportes.removeChild(reportes.firstChild);
        }
    }

    filtrar() {
        const resultado = this.analisis.filter(this.filtrarNombre)
    
        this.mostrarAnalisis()
        console.log(resultado);
    }
    
    filtrarNombre() {

        const objectStore = DB.transaction('analisis').objectStore('analisis');
        objectStore.openCursor().onsuccess = function(e) {
            const cursor = e.target.result;
            console.log(cursor.value.analisis)
            
            if(objetoFiltro.nombreAnalisis) {
                return cursor.value.analisis.toLowerCase() === objetoFiltro.nombreAnalisis
            }
            return cursor.value;
        }


    }

}

const agregar = new AgregarAnalisis()

inputAnalisis.addEventListener('input', tomarValor);
inputEmpresa.addEventListener('input', tomarValor);
inputFecha.addEventListener('input', tomarValor);
inputTelefono.addEventListener('input', tomarValor);
inputResultado.addEventListener('input', tomarValor);
inputCorreo.addEventListener('input', tomarValor);
formulario.addEventListener('submit', validarAgregar);

buscador.addEventListener('input', (e) => {
    objetoFiltro.nombreAnalisis = e.target.value;
    console.log(objetoFiltro)
    agregar.filtrar();
})

function tomarValor(e) {
    objeto[e.target.name] = e.target.value;
}

function validarAgregar(e) {
    e.preventDefault();

    const {analisis, fecha, telefono, correo, resultado, empresa} = objeto;

    if(analisis === '' || fecha === '' || telefono === '' || correo === '' || resultado === '' || empresa === '') {
        alert('Debes diligenciar todos los campos');
        return
    }

    formulario.reset();
    
    objeto.id = Date.now();

    agregar.agregarNuevo({...objeto});

    const transaccion = DB.transaction(['analisis'], 'readwrite');
    const objectStore = transaccion.objectStore('analisis');
    objectStore.add(objeto)

    transaccion.oncomplete = function() {
        console.log('Agregado correctamente a la base de datos')
    }

    transaccion.onerror = function() {
        console.log('Error al agregar registro a la base de datos')
    }

    reiniciarObjeto();

    setTimeout(() => {
        location.reload();
    }, 1000);

}

function reiniciarObjeto() {
    objeto.analisis = '';
    objeto.correo = '';
    objeto.fecha = '';
    objeto.resultado = '';
    objeto.telefono = '';
    objeto.empresa = '';
}

function crearDB() {
    const db = window.indexedDB.open('analisisDB', 1);

    db.onerror = function() {
        console.log('Hubo un error al crear la base de datos');
    }

    db.onsuccess = function() {
        console.log('Base de datos creada con exito');
        DB = db.result;
        agregar.mostrarAnalisis();
    }

    db.onupgradeneeded = function(e) {
        const baseDato = e.target.result;

        const objectStore = baseDato.createObjectStore('analisis', {
            keyPath: 'id',
            autoIncrement: true
        })

        objectStore.createIndex('analisis', 'analisis', {unique: false});
        objectStore.createIndex('correo', 'correo', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('empresa', 'empresa', {unique: false});
        objectStore.createIndex('resultado', 'resultado', {unique: false});
    }
}