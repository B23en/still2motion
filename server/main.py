from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
import os
import uuid
import asyncio
import subprocess
from typing import Dict
from contextlib import asynccontextmanager

# 업로드 폴더 생성
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup
    yield
    # Shutdown: uploads 폴더의 모든 이미지 삭제
    if os.path.exists(UPLOAD_FOLDER):
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    print(f"Deleted: {file_path}")
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
        print(f"Cleanup completed: All files in {UPLOAD_FOLDER} have been deleted")

app = FastAPI(lifespan=lifespan)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 작업 상태 저장
tasks: Dict[str, dict] = {}

@app.get("/")
def read_root():
    return {"message": "hello"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # 기존 업로드된 이미지 삭제
        if os.path.exists(UPLOAD_FOLDER):
            for existing_file in os.listdir(UPLOAD_FOLDER):
                file_path = os.path.join(UPLOAD_FOLDER, existing_file)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                        print(f"Deleted existing file: {file_path}")
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

        # 파일 읽기
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # RGB로 변환 (RGBA나 다른 모드를 JPG로 변환하기 위해)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")

        # 고유 파일명 생성
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # JPG로 저장
        image.save(filepath, "JPEG", quality=95)

        return {
            "success": True,
            "filename": filename,
            "size": image.size,
            "message": "Image uploaded and converted to JPG"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/api/generate-motion")
async def generate_motion(data: dict):
    """모션 생성 요청"""
    try:
        filename = data.get("filename")
        prompt = data.get("prompt")

        if not filename or not prompt:
            return {"success": False, "error": "Missing filename or prompt"}

        # Task ID 생성
        task_id = str(uuid.uuid4())

        # 작업 정보 저장
        tasks[task_id] = {
            "status": "pending",
            "filename": filename,
            "prompt": prompt,
            "output": None
        }

        return {
            "success": True,
            "task_id": task_id
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.websocket("/ws/logs/{task_id}")
async def websocket_logs(websocket: WebSocket, task_id: str):
    """실시간 로그 스트리밍"""
    await websocket.accept()

    try:
        if task_id not in tasks:
            await websocket.send_text("[ERROR] Task not found")
            await websocket.close()
            return

        task = tasks[task_id]
        task["status"] = "running"

        # 이미지 경로
        image_path = os.path.join(UPLOAD_FOLDER, task["filename"])

        # config.txt에서 파라미터 읽기
        config_path = os.path.join(os.path.dirname(__file__), "config.txt")
        params = []
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    # 주석이 아니고 빈 줄이 아닌 경우
                    if line and not line.startswith('#'):
                        # --key value 형식을 분리해서 추가
                        params.extend(line.split())

        # dummy.py 실행 (나중에 generate.py로 변경)
        cmd = [
            "python",
            "-u",  # unbuffered output
            "dummy.py",
            "--image", image_path,
            "--prompt", f'"{task["prompt"]}"'  # 따옴표로 감싸기
        ]

        # config.txt의 파라미터 추가
        cmd.extend(params)

        # subprocess로 실행
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=0,  # unbuffered
            cwd=os.path.dirname(__file__),
            universal_newlines=True
        )

        # 실시간 로그 전송
        for line in process.stdout:
            await websocket.send_text(line.strip())
            await asyncio.sleep(0.01)  # 약간의 딜레이

        # 프로세스 종료 대기
        process.wait()

        # 작업 완료 처리 - 성공/실패 여부와 관계없이 항상 [DONE] 전송
        if process.returncode == 0:
            task["status"] = "completed"
            await websocket.send_text("[SUCCESS] Generation completed successfully")
        else:
            task["status"] = "failed"
            await websocket.send_text(f"[ERROR] Process failed with code {process.returncode}")

        # 항상 [DONE] 메시지 전송하여 프론트엔드에서 종료 처리
        await websocket.send_text("[DONE] Process finished")

    except WebSocketDisconnect:
        print(f"WebSocket disconnected for task {task_id}")
    except Exception as e:
        try:
            await websocket.send_text(f"[ERROR] {str(e)}")
            # 에러 발생 시에도 [DONE] 전송하여 종료 처리
            await websocket.send_text("[DONE] Process finished with error")
        except:
            pass
        if task_id in tasks:
            tasks[task_id]["status"] = "failed"
    finally:
        await websocket.close()
