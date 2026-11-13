from datetime import datetime
from typing import List
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel

app = FastAPI(title="Enfermería Escolar")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

REGISTROS: List[dict] = []


class RegistroAccidente(BaseModel):
    nombre: str
    curso: str
    atencion_requerida: str  
    motivo: str              
    atencion: str            

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()

@app.get("/", response_class=HTMLResponse)
async def vista_enfermera(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.get("/informe", response_class=HTMLResponse)
async def vista_tv(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="informe.html", 
        context={"registros_iniciales": REGISTROS}
    )


@app.post("/api/registrar")
async def registrar_accidente(datos: RegistroAccidente):
    nuevo_registro = {
        "nombre": datos.nombre.strip(),
        "curso": datos.curso.strip(),
        "atencion_requerida": datos.atencion_requerida,
        "motivo": datos.motivo.strip(),
        "atencion": datos.atencion.strip(),
        "hora": datetime.now().strftime("%H:%M")
    }
    
    REGISTROS.append(nuevo_registro)
    await manager.broadcast(nuevo_registro)
    return {"status": "ok", "registro": nuevo_registro}

@app.websocket("/ws/informe")
async def websocket_informe(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
