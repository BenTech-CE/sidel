# 1. Import the InferencePipeline library
from inference import InferencePipeline
import cv2
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ROBOFLOW_API_KEY")

if not api_key:
    raise ValueError("A ROBOFLOW_API_KEY não foi encontrada! Verifique o arquivo .env")

def my_sink(result, video_frame):
    if result.get("output_image"): # Display an image from the workflow response
        cv2.imshow("Workflow Image", result["output_image"].numpy_image)
        cv2.waitKey(1)
    # Do something with the predictions of each frame
    print(result)


# 2. Initialize a pipeline object
pipeline = InferencePipeline.init_with_workflow(
    api_key=api_key,
    workspace_name="bentech",
    workflow_id="detect-count-and-visualize",
    video_reference=0, # Path to video, device id (int, usually 0 for built in webcams), or RTSP stream url
    max_fps=24,
    on_prediction=my_sink
)

# 3. Start the pipeline and wait for it to finish
pipeline.start()
pipeline.join()
