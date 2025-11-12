# Still2Motion - Guide

- *구동환경 호환 및 드라이버 문제로 소스 파일 형태로 공유함*
- *사용자 환경에 따른 빌드 가능*

## 요구 사항
- 최소 24GB VRAM 이상의 환경 (e.g. RTX 4090)
- node.js (테스트 환경: 24v.xx)
- python3 (테스트 환경: 3.10v)

## 환경 세팅
```bash
npm install

# torch >= 2.4.0
cd server
pip install -r requirements.txt
```

## 구동 방법
```bash
# UI
npm run dev

# Server
cd server
python ./main.py
```

## 사용법
1. Base Character 이미지 업로드 (전신이 나오는 정면 이미지 추천, test_image 폴더 참고)
2. Motion Prompt 선택 (영어)
3. 애니메이션 생성 후 outputs 폴더에 저장 (환경에 따라 많은 시간 소요되거나 모델 호환 문제 발생 가능, 로그 확인 요망)

## Generative Model Reference
**Wan2.2(TI2V-5B):** https://github.com/Wan-Video/Wan2.2?tab=readme-ov-file