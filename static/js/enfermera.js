document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-accidente");
    const mensajeStatus = document.getElementById("mensaje-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const payload = {
            nombre: document.getElementById("nombre").value,
            curso: document.getElementById("curso").value,
            atencion_requerida: document.getElementById("atencion_requerida").value,
            motivo: document.getElementById("motivo").value,
            atencion: document.getElementById("atencion").value
        };

        // Imprimimos en consola el paquete exacto que enviamos
        console.log("Datos enviados:", payload);

        try {
            const response = await fetch("/api/registrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                mostrarMensaje("¡Alumno registrado con éxito!", "exito");
                form.reset();
                document.getElementById("nombre").focus();
            } else {
                // AHORA IMPRIMIREMOS EL ERROR EXACTO QUE MANDA FASTAPI
                const errorDetalle = await response.json();
                console.error("DETALLE DEL ERROR 422:", errorDetalle);
                mostrarMensaje("Error al registrar alumno. Intente nuevamente.", "error");
            }
        } catch (error) {
            console.error("Error de red:", error);
            mostrarMensaje("Error de conexión con el servidor.", "error");
        }
    });

    function mostrarMensaje(texto, tipo) {
        if (!mensajeStatus) return;
        mensajeStatus.textContent = texto;
        mensajeStatus.className = `mensaje ${tipo}`;
        mensajeStatus.style.display = "block";

        setTimeout(() => {
            mensajeStatus.style.display = "none";
        }, 3000);
    }
});