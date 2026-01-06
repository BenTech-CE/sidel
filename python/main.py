from inference import InferencePipeline
import cv2
import os
import base64
import numpy as np
from collections import Counter
from dotenv import load_dotenv
import socketio
import requests
from colorama import init as colorama_init
from colorama import Fore
from colorama import Style

colorama_init()

load_dotenv()

api_key = os.getenv("ROBOFLOW_API_KEY")
socket_server_url = os.getenv("SOCKET_SERVER_URL", "http://localhost:3000")
login_email = os.getenv("SOCKET_LOGIN_EMAIL", "")
login_password = os.getenv("SOCKET_LOGIN_PASSWORD", "")

if not api_key:
    raise ValueError("A ROBOFLOW_API_KEY não foi encontrada! Verifique o arquivo .env")

# HTTP Session
http_session = requests.Session()

login_response = http_session.post(f'{socket_server_url}/login', json={
    'email': login_email, 
    'password': login_password
})

if login_response.status_code != 201:
    print(f"{Fore.YELLOW}Falha no login: {login_response.text}{Style.RESET_ALL}")

# Initialize Socket.IO client
sio = socketio.Client(http_session=http_session)

@sio.event
def connect():
    print(f"{Fore.GREEN}Conectado ao servidor Socket.IO: {socket_server_url}{Style.RESET_ALL}")

@sio.event
def disconnect():
    print(f"{Fore.YELLOW}Desconectado do servidor Socket.IO{Style.RESET_ALL}")
@sio.event
def connect_error(data):
    print(f"{Fore.YELLOW}Erro de conexão Socket.IO: {data}{Style.RESET_ALL}")

# Connect to Socket.IO server
try:
    sio.connect(socket_server_url)
except Exception as e:
    print(f"{Fore.YELLOW}Não foi possível conectar ao servidor Socket.IO: {e}{Style.RESET_ALL}")

pipeline = None

def my_sink(result, video_frame):
    global pipeline
    
    predictions = result.get("predictions")
    detection_data = {
        "detected": False,
        "count": 0,
        "objects": [],
        "summary": {}
    }
    
    # Process detections
    if predictions and len(predictions.class_id) > 0:
        count = len(predictions.class_id)
        class_names = predictions.data.get("class_name", [])
        
        detection_data["detected"] = True
        detection_data["count"] = count
        
        if len(class_names) > 0:
            resumo = dict(Counter(class_names))
            detection_data["summary"] = resumo
            detection_data["objects"] = list(class_names)
            resumo_str = ", ".join([f"{qtd} {nome}" for nome, qtd in resumo.items()])
            print(f"{Fore.CYAN}Detectado: {Fore.YELLOW}{count}{Fore.CYAN} objetos ({resumo_str}){Style.RESET_ALL}")
        else:
            detection_data["objects"] = list(predictions.class_id)
            print(f"{Fore.CYAN}Detectado: {Fore.YELLOW}{count}{Fore.CYAN} objetos (IDs: {predictions.class_id}){Style.RESET_ALL}")
    #else:
    #    print(".", end="", flush=True)
    
    # Encode image to base64 and send via Socket.IO
    if sio.connected:
        try:
            image_data = None
            
            # Try to get output image with annotations
            if result.get("output_image"):
                img = result["output_image"].numpy_image
                _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 80])
                image_data = base64.b64encode(buffer).decode('utf-8')
            # Fallback to original frame
            elif video_frame is not None:
                img = video_frame.image
                _, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 80])
                image_data = base64.b64encode(buffer).decode('utf-8')
            
            # Send data to server
            payload = {
                "image": image_data,
                "detection": detection_data
            }

            sio.emit("detection_data", payload)
            
        except Exception as e:
            print(f"{Fore.YELLOW}Erro ao enviar dados: {e}{Style.RESET_ALL}")

# 2. Initialize pipeline
pipeline = InferencePipeline.init_with_workflow(
    api_key=api_key,
    workspace_name="bentech",
    workflow_id="detect-count-and-visualize",
    video_reference=1, 
    max_fps=24,
    video_source_properties={
        "frame_width": 1280,
        "frame_height": 720,
    },
    on_prediction=my_sink
)

# 3. Start
print("Iniciando processamento...")
print("Pressione Ctrl+C no terminal para parar.")

try:
    pipeline.start()
    pipeline.join()
except KeyboardInterrupt:
    print("\nParando...")
    pipeline.terminate()
finally:
    if sio.connected:
        sio.disconnect()

print("Detecção finalizada.")