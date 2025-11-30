from inference import InferencePipeline
import cv2
import os
import numpy as np
from collections import Counter
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ROBOFLOW_API_KEY")

# --- CONFIGURAÇÕES ---
# Defina como False para rodar em "background" (sem janela)
MOSTRAR_JANELA = False 
# ---------------------

if not api_key:
    raise ValueError("A ROBOFLOW_API_KEY não foi encontrada! Verifique o arquivo .env")

pipeline = None

def my_sink(result, video_frame):
    global pipeline
    
    # --- 1. Lógica de Print Humanamente Legível ---
    predictions = result.get("predictions")
    
    # Verifica se há detecções
    if predictions and len(predictions.class_id) > 0:
        count = len(predictions.class_id)
        
        # Tenta pegar os nomes das classes (ex: 'person', 'car')
        # O objeto predictions.data['class_name'] é um array numpy
        class_names = predictions.data.get("class_name", [])
        
        if len(class_names) > 0:
            # Conta quantas de cada (ex: {'person': 2, 'car': 1})
            resumo = dict(Counter(class_names))
            resumo_str = ", ".join([f"{qtd} {nome}" for nome, qtd in resumo.items()])
            print(f"✅ Detectado: {count} objetos ({resumo_str})")
        else:
            # Caso não venha o nome da classe, mostra apenas IDs
            print(f"✅ Detectado: {count} objetos (IDs: {predictions.class_id})")
    else:
        # Opcional: printar um ponto ou nada para não poluir o terminal quando vazio
        print(".", end="", flush=True) 

    # --- 2. Lógica da Janela (Toggle) ---
    if MOSTRAR_JANELA:
        if result.get("output_image"): 
            cv2.imshow("Workflow Image", result["output_image"].numpy_image)
            k = cv2.waitKey(1)

            if k == 27:  # ESC para sair
                cv2.destroyAllWindows()
                print("\nComando de saída recebido. Parando pipeline...")
                if pipeline:
                    pipeline.terminate()

# 2. Initialize pipeline
pipeline = InferencePipeline.init_with_workflow(
    api_key=api_key,
    workspace_name="bentech",
    workflow_id="detect-count-and-visualize",
    video_reference=0, 
    max_fps=24,
    video_source_properties={
        "frame_width": 1280,
        "frame_height": 720,
    },
    on_prediction=my_sink
)

# 3. Start
print("Iniciando processamento...")
if not MOSTRAR_JANELA:
    print("Modo silencioso ativado. Pressione Ctrl+C no terminal para parar.")

try:
    pipeline.start()
    pipeline.join()
except KeyboardInterrupt:
    # Captura o Ctrl+C caso a janela esteja desligada
    print("\nCtrl+C detectado. Parando...")
    pipeline.terminate()

print("Programa finalizado.")