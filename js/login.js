// Función para verificar si el token ha expirado
function isTokenExpired() {
    const expirationTime = localStorage.getItem('tokenExpiration');
    return Date.now() >= expirationTime; // Si la hora actual es mayor o igual a la expiración
}

// Agrega un "listener" para el evento de envío del formulario
document.getElementById("loginForm").addEventListener("submit", async function (event) {
    // Evita que el formulario se envíe de la forma tradicional, que recargaría la página
    event.preventDefault();

    // Obtiene los valores de usuario y contraseña desde los campos del formulario
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        // Realiza una solicitud POST al backend para verificar las credenciales
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST', // Método HTTP para enviar datos al servidor
            headers: {
                'Content-Type': 'application/json', // Indica que se envían datos en formato JSON
            },
            body: JSON.stringify({ username, password }), // Convierte los datos en un string JSON
        });

        // Verifica si la respuesta fue exitosa
        const data = await response.json(); // Extrae el contenido de la respuesta en formato JSON


        if (response.ok) {
            console.log("vamos bien");

// Almacena el token en el almacenamiento local del navegador
            localStorage.setItem("token", data.token);
   // Guarda el nombre de usuario en el almacenamiento local
            localStorage.setItem("usuarioLogueado", username);
            // Redirige al usuario a la página principal
            location.href = "index.html";
        } else {

            console.log("y por aca tambien");

            // Si las credenciales son incorrectas, muestra un mensaje de error
            document.getElementById("error-message").textContent = data.message;

            // Limpia el mensaje después de 5 segundos
            setTimeout(() => {
                document.getElementById("error-message").textContent = "";
            }, 5000);
        }

    } catch (error) {
        // Si ocurre un error en la solicitud (por ejemplo, error de red), muestra un mensaje genérico
        document.getElementById("error-message").textContent = "Hubo un problema al conectar con el servidor.";
        // Limpia el mensaje de error después de 5 segundos
        setTimeout(() => {
            document.getElementById("error-message").textContent = "";
        }, 5000);
    }
});

// Función para mostrar u ocultar la contraseña
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const passwordFieldType = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = passwordFieldType;
}

