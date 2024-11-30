// Verifica si el token ha expirado cuando se carga la página
window.onload = function() {
    checkAuth();
};

document.addEventListener("DOMContentLoaded", function(){
   
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });
   
});
let ElUsuarioEstaLogueado;
//cuando el contenido del documento HTML este cargado
document.addEventListener('DOMContentLoaded',()=>{
    // se obtiene el valor asociado a la clave "usuarioLogueado" del localStorage.
 ElUsuarioEstaLogueado=localStorage.getItem("usuarioLogueado")

 //  ElUsuarioEstaLogueado será null si no hay ningún valor asociado a esa clave, 
 //significa que el usuario no está logueado.
 //if, si el usuario no ha iniciado sesión 
if (ElUsuarioEstaLogueado===null){
    //Muestra el elemento con el ID ingreso, que podría ser un botón o enlace para iniciar sesión.
        document.getElementById("ingreso").style.display = 'block';
        //Oculta el elemento con el ID usuarioMostrado, que podría mostrar el nombre del usuario.
        document.getElementById("usuarioMostrado").style.display = 'none';
        //Redirige al usuario a la página login.html
       location.href="login.html";
    } 
// Si ElUsuarioEstaLogueado no es null, esto indica que el usuario está logueado.

    else {
        //Oculta el elemento con el ID ingreso, ya que no es necesario mostrar la opción de inicio de sesión.
        document.getElementById("ingreso").style.display = 'none';
        //Muestra el elemento con el ID usuarioMostrado
        document.getElementById("usuarioMostrado").style.display = 'inline';
        //Establece el contenido de texto del elemento con el ID usuarioMostrado al valor de ElUsuarioEstaLogueado,
        // que es el nombre del usuario almacenado en localStorage.
        document.getElementById("usuarioMostrado").textContent=ElUsuarioEstaLogueado;
    }
});

document.addEventListener('DOMContentLoaded', function(){
    let cantProductos=localStorage.getItem('cantProductos-'+ElUsuarioEstaLogueado);
    document.getElementById('cantCarrito').innerText=cantProductos;
})

function updateCantProductos() {
    const carrito = JSON.parse(localStorage.getItem('carrito-'+ElUsuarioEstaLogueado) || '[]');
    const totalCant = carrito.reduce((acc, producto) => acc + producto.quantity, 0);
    
    // Guarda el total de productos en localStorage
    localStorage.setItem('cantProductos-'+ElUsuarioEstaLogueado, totalCant);

    // Actualiza el contador con el id 'cantCarrito'
    const cantCarritoElement = document.getElementById('cantCarrito');
    if (cantCarritoElement) {
        cantCarritoElement.innerText = totalCant;
    }

    // Actualiza todos los elementos con la clase 'cart-count'
    document.querySelectorAll('.cart-count').forEach(function(element) {
        element.innerText = totalCant;
    });
}

// Llama a la función cuando se carga la página
document.addEventListener('DOMContentLoaded', updateCantProductos);

// Función para verificar autenticación
async function checkAuth() {
     // Recuperar el token almacenado en localStorage
    const token = localStorage.getItem('token');
   
     // Si no hay token, redirigir al usuario a la página de inicio de sesión
    if (!token) {
        location.href="login.html"; // Redirección a la página de login
        return; // Salir de la función
    }

    try {
          // Realizar una solicitud al endpoint protegido para verificar el token
        const response = await fetch('http://localhost:3000/protected', {
            headers: {
                'Authorization': `Bearer ${token}`  // Enviar el token en el encabezado de autorización
            }
        });

         // Si la respuesta no es exitosa (por ejemplo, token inválido), redirigir al login
        if (!response.ok) {
            location.href="login.html"; // Redirección a la página de login
        } 
    } catch (error) {
         // En caso de error en la solicitud (como problemas de red), redirigir al login
        location.href="login.html"; // Redirección a la página de login
    }
}