document.addEventListener("DOMContentLoaded", () => {
    const tablaCuerpo = document.getElementById("lista-registros");
    const indicadorEstado = document.getElementById("estado-conexion");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/informe`;

    let socket;

    function conectarWebSocket() {
        socket = new WebSocket(wsUrl);

        socket.onopen = () => {
            console.log("Conectado al servidor en tiempo real.");
            if (indicadorEstado) {
                indicadorEstado.textContent = "● En vivo";
                indicadorEstado.className = "estado conectado";
            }
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            agregarRegistroATabla(data);
        };

        socket.onerror = (error) => {
            console.error("Error en WebSocket:", error);
        };

        socket.onclose = () => {
            if (indicadorEstado) {
                indicadorEstado.textContent = "○ Desconectado (reintentando...)";
                indicadorEstado.className = "estado desconectado";
            }
            setTimeout(conectarWebSocket, 3000);
        };
    }

    function agregarRegistroATabla(registro) {
        if (!tablaCuerpo) return;

        const filaVacia = document.getElementById("fila-vacia");
        if (filaVacia) {
            filaVacia.remove();
        }

        const tr = document.createElement("tr");
        tr.className = `registro-item motivo-${registro.atencion_requerida} nueva-fila`;

        let badgeClase = "badge-leve";
        let textoBadge = "SUGERENCIA RETIRO";

        if (registro.atencion_requerida === "severo") {
            badgeClase = "badge-severo";
            textoBadge = "ATENCIÓN PSICÓLOGA";
        } else if (registro.atencion_requerida === "grave") {
            badgeClase = "badge-grave";
            textoBadge = "NOTIFICAR APODERADO";
        }

        tr.innerHTML = `
            <td class="col-hora">${registro.hora}</td>
            <td class="col-nombre">${registro.nombre}</td>
            <td class="col-curso">${registro.curso}</td>
            <td class="col-motivo"><strong>${registro.motivo}</strong></td>
            <td class="col-atencion">${registro.atencion}</td>
            <td class="col-acciones">
                <span class="badge ${badgeClase}">${textoBadge}</span>
            </td>
        `;

        tablaCuerpo.insertBefore(tr, tablaCuerpo.firstChild);
    }

    conectarWebSocket();
});