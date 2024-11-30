
// Variable para almacenar la imagen de perfil
let imagenPerfil = undefined

// Obtener el valor del usuario logueado (login.js) desde Local Storage
const emailUsuarioLogueado = localStorage.getItem("usuarioLogueado");

// Verificar si hay un email de usuario logueado
if (emailUsuarioLogueado) {

    //devuelve el perfil del usuario logueado
    var perfilUsuariologueado = JSON.parse(localStorage.getItem(emailUsuarioLogueado))
    if (perfilUsuariologueado) {
       
        // Asigna los valores del perfil a los campos correspondientes en el formulario
        document.getElementById('nombre').value = perfilUsuariologueado.nombre;
        document.getElementById('segundoNombre').value = perfilUsuariologueado.segundoNombre;
        document.getElementById('apellido').value = perfilUsuariologueado.apellido;
        document.getElementById('segundoApellido').value = perfilUsuariologueado.segundoApellido;
        document.getElementById('email').value = perfilUsuariologueado.email;
        document.getElementById('telefono').value = perfilUsuariologueado.telefono;
        document.getElementById('darkModeSwitch').checked = perfilUsuariologueado.tema;
       
   // Si hay una foto de perfil, la asigna al elemento de imagen correspondiente
        if (perfilUsuariologueado.foto) {
            imagenPerfil = perfilUsuariologueado.foto;
            document.getElementById('profilePic').src = perfilUsuariologueado.foto;
        }
    }


    // Asignar el valor del email al span en el HTML
    document.getElementById("profileEmail").textContent = emailUsuarioLogueado;

    // Asignar el valor del email también al campo de entrada en el formulario
    document.getElementById("email").value = emailUsuarioLogueado;
}


// Función para guardar los cambios en el perfil
function guardarCambios() {
    // Obtener los valores de los campos
    const nombre = document.getElementById('nombre').value;
    const segundoNombre = document.getElementById('segundoNombre').value;
    const apellido = document.getElementById('apellido').value;
    const segundoApellido = document.getElementById('segundoApellido').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const darkMode = document.getElementById('darkModeSwitch').checked;

    // Validar campos obligatorios
    if (!nombre || !apellido || !email) {
        // SweetAlert para campos obligatorios
        Swal.fire({
            icon: 'error',
            title: '¡Oops!',
            text: 'Por favor completa los campos obligatorios.',
            confirmButtonText: 'Aceptar',
            timer: 3000
        });
        return;  // Salir de la función si hay campos vacíos
    }

     // Crear un objeto con los datos del perfil 
    const perfil = {
        nombre: nombre,
        segundoNombre: segundoNombre,
        apellido: apellido,
        segundoApellido: segundoApellido,
        email: email,
        telefono: telefono,
        foto: imagenPerfil, // Incluye la imagen de perfil
        tema: darkMode
    };

    // Guarda el perfil en Local Storage, usando el email como clave
    //localStorage.setItem('perfilUsuario', JSON.stringify(perfil)); modifico para que el valor se modifique al cambiar el usuario.
    localStorage.setItem(perfil.email, JSON.stringify(perfil));
      // SweetAlert para indicar éxito
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Los cambios han sido guardados exitosamente.',
        confirmButtonText: 'Aceptar',
        timer: 3000
    });
}

// Funcionalidad para cambiar la foto de perfil
document.addEventListener('DOMContentLoaded', function () {
    const profilePicInput = document.getElementById('profilePicInput'); // Referencia a la entrada de la imagen
    const profilePic = document.getElementById('profilePic'); // Referencia a la imagen de perfil

    // Manejar cambio de foto de perfil
    profilePicInput.addEventListener('change', function (e) {
        const file = e.target.files[0]; // Obtener el archivo subido
        if (file) {
            const reader = new FileReader(); // Crear un lector de archivos
            reader.onload = function (e) {
                // Se AGREGA: Mostrar la imagen seleccionada en el modal
                const modalImage = document.getElementById('modalProfilePic');
                modalImage.src = e.target.result;
                /*profilePic.src = e.target.result;*/ // Cambiar la imagen de perfil
                // SE AGREGA: Mostrar el modal
                const modal = new bootstrap.Modal(document.getElementById('modalProfilePicPreview'));
                modal.show();

                profilePic.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
              
                    // Ajusta el tamaño del canvas
                    const MAX_WIDTH = 800;
                    const scaleSize = MAX_WIDTH / profilePic.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = profilePic.height * scaleSize;
              
                    ctx.drawImage(profilePic, 0, 0, canvas.width, canvas.height);
              
                    // Convertir a base64 con calidad reducida
                    const reducedBase64 = canvas.toDataURL('image/jpeg', 0.7); // Calidad 70%
              imagenPerfil = reducedBase64; // Guardar la imagen en localStorage
                    callback(reducedBase64);
                  };
            };
            reader.readAsDataURL(file); // Leer el archivo como URL de datos
        }
    });


});

// Función para guardar la imagen seleccionada
function guardarImagen() {
    const modalImage = document.getElementById('modalProfilePic');
    // Guardar la imagen en el perfil
    imagenPerfil = modalImage.src; // Asignar la imagen a la variable global

    // Actualizar la imagen de perfil en la página
    document.getElementById('profilePic').src = imagenPerfil;

    // Cerrar el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalProfilePicPreview'));
    modal.hide();
}

function aplicarModoOscuro() {
    const darkModeSwitch = document.getElementById('darkModeSwitch');
    //const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    const darkModeEnabled = darkModeSwitch.checked;
    const elementosConModoOscuro = [
        document.documentElement, // <html>
        document.body,           
        document.querySelector('main'), 
    ];

    // Aplica o quita la clase dark-mode según la preferencia
    elementosConModoOscuro.forEach(el => el.classList.toggle('dark-mode', darkModeEnabled));
    //darkModeSwitch.checked = darkModeEnabled;

    // Evento para alternar modo oscuro y guardar la preferencia
    darkModeSwitch.addEventListener('change', () => {
        elementosConModoOscuro.forEach(el => el.classList.toggle('dark-mode'));
       // localStorage.setItem('darkMode', darkModeSwitch.checked);
    });
}

document.addEventListener('DOMContentLoaded', aplicarModoOscuro);