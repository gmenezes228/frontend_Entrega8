// Declaración e inicialización de la variable para contar productos en el carrito
let cantProductos = 0;
// Obtener el valor del usuario logueado (login.js) desde Local Storage
const emailUsuarioLogueado = localStorage.getItem("usuarioLogueado");

document.addEventListener("DOMContentLoaded", function () {
    // Obtiene el carrito del localStorage y lo convierte en un array
    const carrito = JSON.parse(localStorage.getItem('carrito-' + emailUsuarioLogueado) || '[]');

   // Mostrar los productos en la tabla del carrito
    displayCartItems(carrito);
    document.getElementById('tipoEnvio').addEventListener('change', updateTotals);
    
    // Actualizar la cantidad de productos en el carrito
    updateCantProductos();
});

// Función para actualizar la cantidad de productos en el carrito
function updateCantProductos() {
    // Recuperar el carrito del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito-' + emailUsuarioLogueado) || '[]');
    // Calcular el total de productos sumando las cantidades
    const totalCant = carrito.reduce((acc, producto) => acc + producto.quantity, 0);
   // Guardar el total en el localStorage y actualizar el contador en la interfaz
    localStorage.setItem('cantProductos-' + emailUsuarioLogueado, totalCant);
    document.getElementById('cantCarrito').innerText = totalCant;
}

// Función para mostrar los productos en la tabla del carrito
function displayCartItems(carrito) {
    const cartTableBody = document.getElementById("cart-table-body");
    cartTableBody.innerHTML = "";

      // Si el carrito está vacío, mostrar una alerta y establecer los totales en 0
    if (carrito.length === 0) {
        swal.fire({
            icon: 'warning',
            title: '¡Carrito vacío!',
            text: 'No hay productos en el carrito.',
            confirmButtonText: 'Aceptar',
            timer: 3000
        });

        // Establecemos todos los totales a 0
        document.getElementById('subtotal').textContent = "USD 0.00";
        document.getElementById('costoEnvio').textContent = "USD 0.00";
        document.getElementById('total').textContent = "USD 0.00";
        return;
    }
  // Iterar por cada producto en el carrito y agregar una fila a la tabla
    carrito.forEach((producto, index) => {
        const row = document.createElement("tr");
        let productSubtotalInUSD = producto.subtotal;

         // Convertir el subtotal a USD si está en otra moneda
        if (producto.currency === "UYU") {
            const exchangeRate = 40; // Tasa de cambio fija
            productSubtotalInUSD = (producto.subtotal / exchangeRate).toFixed(2);
        }

         // Crear el contenido HTML para cada fila
        row.innerHTML = `
            <td class="col-sm-2 col-md-2 text-center">
                <img src="${producto.image}" alt="${producto.name}" class="img-thumbnail">
            </td>
            <td class="col-sm-8 col-md-6">
                <h4>${producto.name}</h4> 
                <p>${producto.description}</p> 
            </td>
            <td class="col-sm-1 col-md-1" style="text-align: center">
                <input type="number" value="${producto.quantity}" min="1" class="quantity-input" style="width: 60px; text-align: center" data-index="${index}"> 
            </td>
            <td class="col-sm-1 col-md-1 text-center">
                ${producto.currency} ${producto.cost}
            </td>
            <td class="col-sm-1 col-md-1 text-center">
                USD ${productSubtotalInUSD}
            </td>
            <td class="col-sm-1 col-md-1">
                <button class="btn btn-danger" id="btnClear" data-index="${index}">Eliminar</button>
            </td>
        `;

        // Añadir la fila al cuerpo de la tabla
        cartTableBody.appendChild(row);
    });

     // Actualizar la cantidad de productos, asignar eventos y actualizar los totales
    updateCantProductos();
    attachDeleteButtons();
    attachQuantityChangeEvents();
    updateTotals(); // Actualiza los totales después de mostrar los productos
}

// Asigna eventos a los botones de eliminación
function attachDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".btn-danger");
     // Añadir un evento de clic a cada botón
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const index = this.getAttribute("data-index"); // Obtiene el índice del producto a eliminar
            removeProduct(index); // Llama a la función para eliminar el producto
        });
    });
}

// Asigna eventos para cambios en la cantidad de productos
function attachQuantityChangeEvents() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
     // Añadir un evento de cambio a cada campo de cantidad
    quantityInputs.forEach(input => {
        input.addEventListener('change', () => {
            const index = input.getAttribute('data-index'); // Obtiene el índice del producto
            updateProductQuantity(index, input.value); // Llama a la función para actualizar la cantidad
        });
    });
}

// Función para actualizar la cantidad de un producto
function updateProductQuantity(index, quantity) {
       // Recuperar el carrito del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito-' + emailUsuarioLogueado) || '[]');
    
     // Obtener el producto correspondiente al índice
    const producto = carrito[index]; 
    producto.quantity = Math.max(1, parseInt(quantity)); // Asegura que la cantidad no sea menos de 1
    producto.subtotal = producto.quantity * producto.cost; // Actualiza el subtotal

    localStorage.setItem('carrito-' + emailUsuarioLogueado, JSON.stringify(carrito)); // Guarda el carrito actualizado
    displayCartItems(carrito); // Muestra los productos actualizados
    // updateTotals(); // Actualiza los totales
}

// Función para eliminar un producto del carrito
function removeProduct(index) {
    // Obtiene el carrito actual del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito-' + emailUsuarioLogueado) || '[]');

    // Elimina el producto en el índice especificado
    carrito.splice(index, 1);

    // Actualiza el carrito en localStorage
    localStorage.setItem('carrito-' + emailUsuarioLogueado, JSON.stringify(carrito));

    // Actualiza la cantidad de productos
    updateCantProductos();
    // Mostrar el carrito actualizado
    displayCartItems(carrito);
}

// Función para actualizar el total de una fila
function updateRowTotal(input) {
   // Obtener la fila correspondiente al campo de entrada
    const row = input.closest('tr');
    // Obtener el precio del producto desde la fila
    const price = parseFloat(row.querySelector('td:nth-child(4)').textContent.replace('USD ', ''));
  
    const quantity = Math.max(parseInt(input.value) || 0, 0); // Asegura que no sea negativo
    // Calcular el total de la fila
    const total = quantity * price;
  // Actualizar el texto del total en la fila
    row.querySelector('td:nth-child(5)').textContent = `USD ${total.toFixed(2)}`;
}

// Función para actualizar los totales de la tabla
function updateTotals() {
     // Recuperar el carrito del localStorage
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

    // Si el carrito está vacío, establecer todos los totales a 0
    if (carrito.length === 0) {
        document.getElementById('subtotal').textContent = "USD 0.00";
        document.getElementById('costoEnvio').textContent = "USD 0.00";
        document.getElementById('total').textContent = "USD 0.00";
        return;
    }

    // Si hay productos, calcular normalmente
    const rows = document.querySelectorAll('tbody tr');
    let subtotal = 0;

    rows.forEach(row => {
          // Sumar los totales de cada fila
        const total = parseFloat(row.querySelector('td:nth-child(5)').textContent.replace('USD ', '')) || 0;
        subtotal += total;
    });

    // Actualiza el subtotal en la sección de costos finales
    document.getElementById('subtotal').textContent = `USD ${subtotal.toFixed(2)}`;

    // Calcula el costo de envío
    const tipoEnvio = document.getElementById('tipoEnvio').value;
    let shippingCost = 0;

    if (tipoEnvio === "premium") {
        shippingCost = subtotal * 0.15;
    } else if (tipoEnvio === "express") {
        shippingCost = subtotal * 0.07;
    } else if (tipoEnvio === "standard") {
        shippingCost = subtotal * 0.05;
    }

    // Actualiza el costo de envío en la sección de costos finales
    document.getElementById('costoEnvio').textContent = `USD ${shippingCost.toFixed(2)}`;

    // Calcula y actualiza el total final
    const total = subtotal + shippingCost;
    document.getElementById('total').textContent = `USD ${total.toFixed(2)}`;
}


// Llamar a updateTotals al cargar la página para el cálculo inicial
updateTotals();

// Agregar el evento change al select de tipo de envío porque el usuario puede cambiar de opinión y elegir otro tipo de envío
document.getElementById('tipoEnvio').addEventListener('change', updateTotals);

// Al cargar el DOM, establece la cantidad de productos
document.addEventListener('DOMContentLoaded', function () {
    updateCantProductos();
});

// Evento para manejar el botón "Finalizar compra"
document.getElementById('finalizar').addEventListener('click', (event) => {
    // Evitar el comportamiento por defecto del botón
    event.preventDefault();
     // Validar si hay productos en el carrito y si el formulario es válido
    const formularioDeCompra = document.getElementById('formularioDeCompra');
    const cantidadProductos = localStorage.getItem('cantProductos-' + emailUsuarioLogueado);
    if (cantidadProductos == 0) {
          // Mostrar alerta si el carrito está vacío
        swal.fire({
            icon: 'error',
            title: '¡No es posible comprar!',
            text: 'Carrito vacío.',
            showConfirmButton: false,
            timer: 3000
        });
    }
 // Si el formulario es válido, continuar con la compra
    else if (formularioDeCompra.checkValidity()) {
 // Obtener los valores de los campos del formulario
        const departamento = document.getElementById('departamento').value;
        const localidad = document.getElementById('localidad').value;
        const calle = document.getElementById('calle').value;
        const numero = document.getElementById('numero').value;
        const esquina = document.getElementById('esquina').value;
        const tipoEnvio = document.getElementById('tipoEnvio').value;
        const tarjetaOption = document.getElementById("tarjeta");
         // Determinar el tipo de pago seleccionado
        let tipoPago;
        
        if (tarjetaOption.checked) {
            tipoPago="tarjeta";
        
        } else {
           tipoPago="transferencia";
        }

 // Verificar si existe un token de sesión
        const token = localStorage.getItem('token');
        if (!token) {
             // Mostrar alerta si no hay un token (sesión expirada)
            swal.fire({
                icon: 'error',
                title: '¡Sesión expirada!',
                text: 'Inicie sesión.',
                showConfirmButton: false,
                timer: 3000
            });
        }
        else {

            // Recuperamos el carrito desde localStorage
            const carrito = JSON.parse(localStorage.getItem('carrito-' + emailUsuarioLogueado) || '[]');
            console.log(carrito)

            // Ahora transformamos el carrito al formato deseado
            const carritoTransformado = carrito.map(item => ({
                id: item.id,           // Identificador del producto
                count: item.quantity,    // Cantidad seleccionada
                unitCost: item.cost || 10,  // Si no tiene un unitCost, le asignamos un valor por defecto de 10
                currency: item.currency || "USD"  // Si no tiene currency, le asignamos un valor por defecto "USD"
            }));
//No se envia a servidor los datos de la tarjeta ya que no es correcto porque son datos sensibles.
//Se deben enviar a la aplicacion de la tarjeta

 // Enviar los datos de la compra al servidor mediante fetch
            fetch(CART_BUY_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "user": emailUsuarioLogueado,
                    "articles": carritoTransformado,
                    "shipping": {
                        "tipoEnvio": tipoEnvio,
                        "departamento": departamento,
                        "localidad": localidad,
                        "calle": calle,
                        "numeroPuerta": numero,
                        "esquina": esquina

                    },
                    "payment": {
                        "formaPago": tipoPago
                    }


                }),

            }).then(resp => {
                if (resp.ok) {
                     // Mostrar alerta de éxito si la compra se realizó correctamente
                    swal.fire({
                        icon: 'success',
                        title: 'Compra exitosa',
                        text: 'Gracias por comprar.',
                        showConfirmButton: false,
                        timer: 3000
                    });

                } else if (resp.status === 403) {
                     // Mostrar alerta si la sesión expiró
                    swal.fire({
                        icon: 'error',
                        title: '¡Sesión expirada!',
                        text: '¡Vuelva a iniciar sesión!',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    swal.fire({
                          // Mostrar alerta de error si ocurrió un problema en el servidor
                        icon: 'error',
                        title: '¡Error!',
                        text: '¡Error al comprar!',
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
 // Manejo de errores en la petición
            }).catch(error => swal.fire({
                icon: 'error',
                title: '¡Error!',
                text: error,
                showConfirmButton: false,
                timer: 3000
            })
            );

        }

    }
    else {
         // Mostrar errores del formulario si es inválido
        formularioDeCompra.reportValidity();
        // Hacer visibles los spans de error asociados
        const invalidInputs = formularioDeCompra.querySelectorAll(':invalid');
        invalidInputs.forEach(input => {
            const errorSpan = document.getElementById(input.getAttribute('aria-describedby'));
            if (errorSpan) {
                errorSpan.style.display = 'block';
            }
        });
        // Mostrar alerta para completar campos obligatorios
        swal.fire({
            icon: 'error',
            title: '¡Oops!',
            text: 'Por favor completa los campos obligatorios.',
            showConfirmButton: false,
            timer: 3000
        });
    }
})

// Seleccionamos los elementos relevantes
const tarjetaOption = document.getElementById("tarjeta"); // Opción de pago con tarjeta
const transferenciaOption = document.getElementById("transferencia"); // Opción de pago por transferencia bancaria
const detalleTarjeta = document.getElementById("detalleTarjeta"); // Sección de detalles para el pago con tarjeta

// Función para mostrar u ocultar los detalles de la tarjeta de crédito
function actualizarVistaFormaPago() {
    if (tarjetaOption.checked) {
         // Si la opción de tarjeta está seleccionada, mostrar los detalles de la tarjeta
        detalleTarjeta.style.display = "block"; // Mostramos los detalles de la tarjeta
        document.getElementById('numeroTarjeta').disabled = false; // Habilitar campo de número de tarjeta
        document.getElementById('fechaVencimiento').disabled = false; // Habilitar campo de fecha de vencimiento
        document.getElementById('codigoSeguridad').disabled = false;  // Habilitar campo de código de seguridad

    } else {
        // Si la opción de tarjeta no está seleccionada, ocultar los detalles de la tarjeta
        detalleTarjeta.style.display = "none"; 
        document.getElementById('numeroTarjeta').disabled = true; // Deshabilitar campo de número de tarjeta
        document.getElementById('fechaVencimiento').disabled = true; // Deshabilitar campo de fecha de vencimiento
        document.getElementById('codigoSeguridad').disabled = true; // Deshabilitar campo de código de seguridad
    }
}

// Escuchamos los cambios en las opciones de pago
tarjetaOption.addEventListener("change", actualizarVistaFormaPago); // Cuando se selecciona "tarjeta", actualizar la vista
transferenciaOption.addEventListener("change", actualizarVistaFormaPago); // Cuando se selecciona "transferencia", actualizar la vista

// Ejecutamos la función al cargar la página para mostrar/ocultar según la opción seleccionada inicialmente
actualizarVistaFormaPago();


// Ocultar errores cuando los campos sean corregidos
document.getElementById('formularioDeCompra').addEventListener('input', (event) => {
    const input = event.target; // Campo que generó el evento
    if (input.validity.valid) {
       // Si el campo es válido, ocultar el mensaje de error asociado
        const errorSpan = document.getElementById(input.getAttribute('aria-describedby'));
        if (errorSpan) {
            errorSpan.style.display = 'none'; // Ocultar el span de error
        }
    }
});

// Formato del numero de la tarjeta de credito
document.getElementById('numeroTarjeta').addEventListener('input', function () {
    let value = this.value.replace(/\D/g, ''); // Eliminar cualquier carácter que no sea un número
    if (value.length > 16) {
        value = value.slice(0, 16); // Limitar a 16 dígitos
    }
    // Formatear el número en el formato 1234-1234-1234-1234
    this.value = value.replace(/(\d{4})(?=\d)/g, '$1-');
});