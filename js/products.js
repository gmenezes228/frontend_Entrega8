// Defino dos variables para el rango de precios mínimo y máximo
let minimoPrecio = undefined;
let maximoPrecio = undefined;
let searchQuery = undefined;

//criterios de ordenacion
const ORDEN_DE_PRECIO_MENOR_A_MAYOR = "PrecioAscendente";  // Ordenar de MENOR a MAYOR
const ORDEN_DE_PRECIO_MAYOR_A_MENOR = "PrecioDescendente"; // Ordenar de MAYOR a MENOR
const ORDEN_MAYOR_A_MENOR_DE_VENDIDOS = "VendidosDescendentes"; // Ordenar por cantidad de productos vendidos
let criterioDeOrdenacionActual = undefined; //criterio de ordenacion elegido por el usuario


// Obtiene el ID de la categoría seleccionada del almacenamiento local
const categoriaId = localStorage.getItem('catID');

// Escucha el evento "DOMContentLoaded" para ejecutar el código una vez que todo el contenido del DOM haya sido completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    //Llama a la función para mostrar la lista de productos. invoco la funcion creada a continuacion para no perder funcionalidad
    MostrarListaProductos();
});

//Cuando apreto los botones sucede esto:
document.getElementById("menorAMayor").addEventListener("click", function () {
    ordenaYMuestraProductos(ORDEN_DE_PRECIO_MENOR_A_MAYOR);
});

document.getElementById("mayorAMenor").addEventListener("click", function () {
    ordenaYMuestraProductos(ORDEN_DE_PRECIO_MAYOR_A_MENOR);
});

document.getElementById("vendidosDescendente").addEventListener("click", function () {
    ordenaYMuestraProductos(ORDEN_MAYOR_A_MENOR_DE_VENDIDOS);
});

//En funcion del click que se hace en los botones se ordena la lista
function ordenaYMuestraProductos(criterioDeOrdenacionEnviado) {
    criterioDeOrdenacionActual = criterioDeOrdenacionEnviado;

    // Mostrar las productos ordenadas
    MostrarListaProductos();
}


// Creo una funcion mostrar lista de productos con el llamado a la API

function MostrarListaProductos() {
    // Realiza una solicitud fetch a la URL especificada para obtener los datos de los productos (en este caso, una lista de autos)
    fetch("http://localhost:3000/cats_products/" + categoriaId + ".json")//añade el id de la categoria al link de la api
        .then(response => response.json()) // Convierte la respuesta a un objeto JSON
        .then(productos => {
            // Inicializa una cadena vacía que almacenará el contenido HTML generado para cada producto

            // Inicializa una cadena vacía que almacenará el contenido HTML generado para cada auto
            let listaProductos = "";
// ordena por precio o cantidad de vendidos
            let listaOrdenada = OrdenarProductos(productos.products);
            // Itera sobre cada producto luego de aplicar filtrado y ordenacion
            
            // Itera sobre cada producto en la lista obtenida del JSON
            for (let producto of listaOrdenada) {
                // creo un if, si el rango de precio minimo y maximo es nulo o si el precio del producto es menor al maximo y mayor al minimo, muestra los productos
                if ((minimoPrecio == undefined && maximoPrecio == undefined) || (maximoPrecio != undefined && minimoPrecio == undefined && producto.cost <= maximoPrecio) || (minimoPrecio != undefined && maximoPrecio == undefined && producto.cost >= minimoPrecio) || (producto.cost <= maximoPrecio && producto.cost >= minimoPrecio)) {
                    if (searchQuery == undefined || searchQuery === "" || producto.name.toLowerCase().includes(searchQuery) || producto.description.toLowerCase().includes(searchQuery)) {
                        // Crea un bloque de HTML para cada producto, que incluye una imagen, nombre, descripción, costo y cantidad vendida
                        listaProductos += `
                        <div class="col-md-4 mb-4">
                            <div class="card h-100 shadow-sm">
                                <a href="product-info.html" class="card-link" onclick="setProductId('${producto.id}')">
                                    <img src="${producto.image}" class="card-img-top" alt="Imagen de ${producto.name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${producto.name}</h5>
                                        <p class="card-text">${producto.description}</p>
                                        <p class="card-text text-primary"><strong>${producto.currency} ${producto.cost}</strong></p>
                                        <p class="card-text text-muted">Vendidos: ${producto.soldCount}</p>
                                    </div>
                                </a>
                            </div>
                        </div>`;                                      
                    }
                }

            }
            // Si no hay productos que coincidan con el rango de precios, muestra un mensaje indicando que no hay productos en el rango
            if (listaProductos == "") {
                listaProductos += `<p>No hay productos encontrados.</p>`;
            }
            // Obtiene el nombre de la categoría y lo muestra en el título
            let nombreCat = productos.catName;
            // Inserta el contenido HTML generado dentro del contenedor con id "productos"
            document.getElementById('titulo').innerHTML = "<h2>Categoría/" + nombreCat + "</h2><br>";
            document.getElementById("productos").innerHTML = listaProductos;
        })
        .catch(error => console.error('Error fetching data:', error)); // Maneja cualquier error que ocurra durante el fetch

}

// Creando el filtro de precio

document.getElementById("rangoFiltroPrecio").addEventListener("click", function () {
    //Obtengo el mínimo y máximo de los intervalos para filtrar por cantidad
    //de productos por categoría.
    minimoPrecio = document.getElementById("precioMinimo").value;
    maximoPrecio = document.getElementById("precioMaximo").value;

    if ((minimoPrecio != undefined) && (minimoPrecio != "") && (parseInt(minimoPrecio)) >= 0) {
        minimoPrecio = parseInt(minimoPrecio);
    }
    else {
        minimoPrecio = undefined;
    }

    if ((maximoPrecio != undefined) && (maximoPrecio != "") && (parseInt(maximoPrecio)) >= 0) {
        maximoPrecio = parseInt(maximoPrecio);
    }
    else {
        maximoPrecio = undefined;
    }
    // Verifica que el rango de precios sea válido; si el máximo es menor o igual al mínimo, muestra un mensaje de error
    if (maximoPrecio != undefined && minimoPrecio != undefined && maximoPrecio <= minimoPrecio) {
        Swal.fire({
            title: 'Error en rango de precios',
            text: "Seleccione un rango válido",
            confirmButtonText: 'Aceptar',            
            icon: "warning",
            timer: 3000
        })
        limpiarFiltro(); // Limpia los filtros si hay un error en el rango
    }
    // Vuelve a mostrar la lista de productos aplicando los nuevos filtros de precio
    MostrarListaProductos();
});

// Evento para borrar los filtros de precios
document.getElementById("limpiarRangoFiltroPrecio").addEventListener("click", function () {
    // Limpia los filtros y vuelve a mostrar la lista de productos sin filtros
    limpiarFiltro();
    limpiarOrden();
    limpiarBuscador()
    MostrarListaProductos();
});

// Función para limpiar los filtros de precios
function limpiarFiltro() {
    // Limpia los valores de los campos de precio mínimo y máximo en el formulario
    document.getElementById("precioMaximo").value = "";
    document.getElementById("precioMinimo").value = "";

    minimoPrecio = undefined;
    maximoPrecio = undefined;
}

// Función para limpiar ordenamiento
function limpiarOrden() {
    criterioDeOrdenacionActual = undefined;
}

//Funcion para ordenar los productos 

function OrdenarProductos(listaDeProductosAOrdenar) {
    let listaDeProductosOrdenados = [];

    // Ordenar(SORT) productos de menor a mayor
    if (criterioDeOrdenacionActual === ORDEN_DE_PRECIO_MENOR_A_MAYOR) {
        listaDeProductosOrdenados = listaDeProductosAOrdenar.sort(function (a, b) {
            if (a.cost < b.cost) { return -1; }
            if (a.cost > b.cost) { return 1; }
            return 0;
        });
    }
    // Ordenar productos de mayor a menor
    else if (criterioDeOrdenacionActual === ORDEN_DE_PRECIO_MAYOR_A_MENOR) {
        listaDeProductosOrdenados = listaDeProductosAOrdenar.sort(function (a, b) {
            if (a.cost > b.cost) { return -1; }
            if (a.cost < b.cost) { return 1; }
            return 0;
        });
    }
    // Ordenar por cantidad de productos vendidos
    else if (criterioDeOrdenacionActual === ORDEN_MAYOR_A_MENOR_DE_VENDIDOS) {
        listaDeProductosOrdenados = listaDeProductosAOrdenar.sort(function (a, b) {
            if (a.soldCount > b.soldCount) { return -1; }
            if (a.soldCount < b.soldCount) { return 1; }
            return 0;
        });
    }
    else {
        listaDeProductosOrdenados = listaDeProductosAOrdenar;
    }
    return listaDeProductosOrdenados;
}

// Función que guarda el ID del producto en localStorage y redirige a product-info.html
function setProductId(productId) {
    localStorage.setItem('selectedProductId', productId);
}

//apartado para el funcionamiento de la búsqueda en products.html
document.addEventListener('DOMContentLoaded', function () {  
    // Añade un evento de búsqueda para el campo de búsqueda
    document.getElementById("searchInput").addEventListener("keyup", function (event) {
        if (event.key === 'Enter') {
            searchQuery = document.getElementById("searchInput").value.trim().toLowerCase();
            MostrarListaProductos()
        }
    });
});

// Función para limpiar buscador
function limpiarBuscador() {
    document.getElementById("searchInput").value = ""
    searchQuery = undefined;
   }
   
   