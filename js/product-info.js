document.addEventListener('DOMContentLoaded', function () {
    // Obtiene el ID del producto seleccionado desde el almacenamiento local
    const productId = localStorage.getItem('selectedProductId');


    if (productId) {
        // Realiza una solicitud fetch para obtener la información del producto desde la API
        fetch(`http://localhost:3000/products/${productId}`)
            .then(response => response.json()) // Convierte la respuesta en JSON
            .then(product => {
                localStorage.setItem('product', JSON.stringify(product))
                // Actualiza la información del producto en el HTML
                document.getElementById('product-name').textContent = product.name;
                document.getElementById('product-description').textContent = product.description;
                document.getElementById('category-name').textContent = product.category;
                document.getElementById('sold-quantity').textContent = product.soldCount;
                document.getElementById('product-cost').textContent = product.cost;
                document.getElementById('product-currency').textContent = product.currency;

                // Obtiene el contenedor de imágenes y limpia cualquier contenido previo
                const imagesContainer = document.getElementById('product-images');
                imagesContainer.innerHTML = ''; // Limpia cualquier contenido previo

                if (product.images && product.images.length > 0) {
                    // Crear el contenedor del carrusel
                    const carouselDiv = document.createElement('div');
                    carouselDiv.id = 'productCarousel'; // Asegúrate de que el ID sea único
                    carouselDiv.classList.add('carousel', 'slide');
                    carouselDiv.setAttribute('data-bs-ride', 'carousel');

                    // Crear la parte de carousel-inner
                    const carouselInnerDiv = document.createElement('div');
                    carouselInnerDiv.classList.add('carousel-inner');

                    // Agregar imágenes al carrusel
                    product.images.forEach((imageUrl, index) => {
                        const carouselItemDiv = document.createElement('div');
                        carouselItemDiv.classList.add('carousel-item');

                        // Marca el primer item como activo
                        if (index === 0) {
                            carouselItemDiv.classList.add('active');
                        }

                        // Crea el elemento de imagen y lo agrega al item del carrusel
                        const img = document.createElement('img');
                        img.src = imageUrl;
                        img.classList.add('d-block', 'w-100'); // Clase Bootstrap para asegurar que la imagen ocupa todo el ancho del contenedor
                        img.alt = `Imagen ${index + 1}`;


                        // Ajusta el tamaño de las imágenes sin recortarlas
                        img.style.maxHeight = '400px'; // Ajusta la altura máxima según sea necesario
                        img.style.width = 'auto'; // Ajusta el ancho automáticamente para mantener la proporción
                        img.style.height = 'auto'; // Ajusta la altura automáticamente para mantener la proporción
                        img.style.objectFit = 'contain'; // Asegura que la imagen se ajuste dentro del contenedor sin recortarse
                        img.style.display = 'block'; // Asegura que la imagen se muestre como un bloque
                        img.style.margin = '0 auto'; // Centra la imagen dentro del contenedor
                        


                        carouselItemDiv.appendChild(img); // Añade la imagen al item del carrusel
                        carouselInnerDiv.appendChild(carouselItemDiv); // Añade el item al contenedor del carrusel
                    });

                    // Crear los controles del carrusel (botones de anterior y siguiente)
                    const prevButton = document.createElement('button');
                    prevButton.classList.add('carousel-control-prev');
                    prevButton.setAttribute('type', 'button');
                    prevButton.setAttribute('data-bs-target', '#productCarousel'); // Asegúrate de que el selector coincida con el ID del carrusel
                    prevButton.setAttribute('data-bs-slide', 'prev');
                    prevButton.innerHTML = `
                    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Previous</span>
                `;

                    const nextButton = document.createElement('button');
                    nextButton.classList.add('carousel-control-next');
                    nextButton.setAttribute('type', 'button');
                    nextButton.setAttribute('data-bs-target', '#productCarousel'); // Asegúrate de que el selector coincida con el ID del carrusel
                    nextButton.setAttribute('data-bs-slide', 'next');
                    nextButton.innerHTML = `
                    <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    <span class="visually-hidden">Next</span>
                `;

                    // Ensamblar el carrusel: añade el contenedor de imágenes, y los controles al contenedor del carrusel
                    carouselDiv.appendChild(carouselInnerDiv);
                    carouselDiv.appendChild(prevButton);
                    carouselDiv.appendChild(nextButton);

                    // Agregar el carrusel al contenedor de imágenes
                    imagesContainer.appendChild(carouselDiv);
                } else {
                    // Muestra un mensaje si no hay imágenes disponibles
                    imagesContainer.innerHTML = '<p>No images available.</p>';
                }
                //Llamo la funcion que muestra los comentarios luego de que se carga la pagina
                MostrarComentarios(productId);

                // Mostrar los productos relacionados
                mostrarProductosRelacionados(product.relatedProducts);
                
            })
            .catch(error => console.error('Error fetching product data:', error));
    } else {
        console.error('No product ID found in localStorage.');
    }
});

//Al implementar el Backend se modificó el control de las respuestas para no duplicar acciones y que entraran en conflicto.
function MostrarComentarios(productId) {
    // URL de tu API
    const apiUrl = `http://localhost:3000/products_comments/${productId}`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error al obtener comentarios: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.success) {
                throw new Error(data.message || 'Error desconocido');
            }

            const comentarios = data.comments;
            let listaComentarios = "";

            // Genera HTML para los comentarios
            for (let comentario of comentarios) {
                listaComentarios += generarComentariosHTML(
                    comentario.user,
                    convertirFecha(comentario.dateTime),
                    comentario.score,
                    comentario.description
                );
            }

            // Si no hay comentarios, muestra un mensaje.
            if (!listaComentarios) {
                listaComentarios = `<p>No se encontraron comentarios.</p>`;
            }

            // Inserta los comentarios en el contenedor
            document.getElementById("comentarios").innerHTML = listaComentarios;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById("comentarios").innerHTML = `<p>Error al cargar los comentarios: ${error.message}</p>`;
        });
}



// Función para generar estrellas basadas en la calificación
function generarEstrellas(scoreProducto) { 
    const estrellas = Math.round(scoreProducto); // Redondeamos la calificación directamente a un valor entre 0 y 5
    let estrellasHtml = ''; // Variable para el HTML de las estrellas

    // Creamos el HTML para las estrellas
    for (let i = 1; i <= 5; i++) {
        if (i <= estrellas) {
            estrellasHtml += '<span class="fa fa-star checked"></span>'; // Estrella llena
        } else {
            estrellasHtml += '<span class="fa fa-star"></span>'; // Estrella vacía
        }
    }
    return estrellasHtml; // Devolvemos el HTML generado
}

//apartado para las nuevas calificaciones, con estrellas

const stars = document.querySelectorAll('.star');
let nuevaCalificacion = 0;  // Variable para almacenar la calificación del usuario

stars.forEach(function(star, index) {
    star.addEventListener('click', function() {
        // Agregamos o quitamos la clase "checked" (le da el color gold) para las estrellas seleccionadas
        for (let i = 0; i <= index; i++) {
            stars[i].classList.add('checked');
        }
        for (let i = index + 1; i < stars.length; i++) {
            stars[i].classList.remove('checked');
        }

        // Asignamos la calificación basada en el número de estrellas seleccionadas
        nuevaCalificacion = index + 1;
        console.log('Calificación del usuario:', nuevaCalificacion);  // Mostramos el puntaje en la consola
    });
});

function fechaActual(){
    let fechaHoy=new Date();
    return (fechaHoy.getDate()+"/"+(fechaHoy.getMonth()+1)+"/"+fechaHoy.getFullYear());
}

function convertirFecha(fecha){
    fecha=new Date(fecha);
    return (fecha.getDate()+"/"+(fecha.getMonth()+1)+"/"+fecha.getFullYear());
}


document.getElementById("enviarComentario").addEventListener("click", function(){
    let comUsuario= document.getElementById("comentarioUsuario").value;
    let fechaComentario=fechaActual();
    let nombreUsuario= localStorage.getItem("usuarioLogueado");
    let calificacionComentario=nuevaCalificacion;

    // Verificar si el campo de comentario y calificación están llenos 
    if (!comUsuario || !calificacionComentario) { 
        Swal.fire({
            icon: 'warning',
            title: '¡Por favor, completa los campos antes de enviar!',
            confirmButtonText: 'Aceptar',
            timer: 3000
        }); //usamos sweet alert
    return; // Detener la ejecución si hay campos vacíos
    }

    let listaNuevosComentarios="";

    listaNuevosComentarios+= generarComentariosHTML(
        nombreUsuario,
        fechaComentario,
        calificacionComentario,
        comUsuario,
    );

    document.getElementById("nuevosComentarios").innerHTML += listaNuevosComentarios; //se agrega funcionalidad para que se guarden los nuevos comentarios
});

// funcion para mostrar productos relacionados //
function mostrarProductosRelacionados(relatedProducts) {
    let relatedHTML = '';
    relatedProducts.forEach(product => {
        relatedHTML += `
            <div class="related-product col-3" onclick="seleccionarProducto(${product.id})">
                <img src="${product.image}" class="img-thumbnail">
                <h5>${product.name}</h5>
            </div>
        `;
    });
    document.getElementById('related-products').innerHTML = relatedHTML;
}
// redirecciona al product-info al hacer click en el producto relacionado //
function seleccionarProducto(id) {
    localStorage.setItem('selectedProductId', id);
    window.location.href = 'product-info.html';
}

//funcion para generar el HTML de todos los comentarios, exitentes y nuevos

function generarComentariosHTML(usuario, fecha, calificacion, descripcion){
    const estrellasHtml = generarEstrellas(calificacion);

    return `
                <div class="comentariosDeLosProductos">
                    <strong><p id="nombreDelUsuario">Usuario: ${usuario}</p></strong>
                    <p id="fechaDelComentario">${fecha}</p>
                    <p id="calificacionDelProducto">Calificación del producto: 
                        <span id="estrellas">${estrellasHtml}</span></p>
                    <p id="descripcionDelProducto">Descripción del producto: 
                        <label id="comentario">${descripcion}</label>
                    </p>
                </div><br>`;
}

//función para botón de comprar, guardar producto en localstorage y redirigir al cart.html
document.addEventListener('DOMContentLoaded', ()=>{
    let btnAgregar= document.getElementById("botonComprar");
    btnAgregar.addEventListener('click',()=>{
         //const productId = localStorage.getItem('selectedProductId');
         const product = JSON.parse(localStorage.getItem('product'));
        let producto = {};
        let carrito = [];
        let existeEnCarrito = false
        let nombreUsuario= localStorage.getItem("usuarioLogueado");
        // Obtengo el carrito del LocalStorage y, si no hay carrito, creo uno vacío
        carrito = JSON.parse(localStorage.getItem('carrito-'+nombreUsuario) || '[]');

        // Recorre cada producto en el carrito y si ya existe le aumentamos la cantidad
        carrito.forEach((productoEnCarrito) => {
            if (productoEnCarrito.id === product.id){
                productoEnCarrito.quantity += 1
                productoEnCarrito.subtotal = productoEnCarrito.cost * productoEnCarrito.quantity
                existeEnCarrito = true
            }
        });

        if (!existeEnCarrito){
            // Creo el producto con todos los atributos
            producto.id = product.id

            producto.name = product.name
            producto.description = product.description
            producto.cost = product.cost
            producto.currency = product.currency            
            producto.image = product.images[0];             
            producto.subtotal = producto.cost     //era parte 4 de la entrega? revisar
            producto.quantity = 1;

             // Guardo el producto en mi carrito
            carrito.push(producto);
        }
        
        // Guardo en el localStorage el carrito actualizado (convierto a JSON)
        localStorage.setItem('carrito-'+nombreUsuario, JSON.stringify(carrito));
        
        console.log(carrito);

        //ya puedo redireccionar
        window.location.href = "cart.html";
    })
})