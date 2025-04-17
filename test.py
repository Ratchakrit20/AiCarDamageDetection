import cv2
from detectron2.config import get_cfg
from detectron2 import model_zoo
from detectron2.engine import DefaultPredictor
from detectron2.modeling import build_model
import json
import torch


# โหลดข้อมูล metadata จากไฟล์ JSON
# with open('./Damage_parts_model/metrics.json', 'r') as f:
#     metadata = json.load(f)

# โหลดไฟล์การตั้งค่า
def setup_cfg():
    cfg = get_cfg()
    cfg.merge_from_file(model_zoo.get_config_file("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml"))
    cfg.MODEL.WEIGHTS = model_zoo.get_checkpoint_url("COCO-InstanceSegmentation/mask_rcnn_R_50_FPN_3x.yaml")
    cfg.DATASETS.TRAIN = ("car_train",)
    cfg.DATASETS.TEST = ("car_val",)
    cfg.DATALOADER.NUM_WORKERS = 4
    cfg.MODEL.DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
    cfg.SOLVER.IMS_PER_BATCH = 4
    cfg.SOLVER.BASE_LR = 0.00025
    cfg.SOLVER.MAX_ITER = 3000
    cfg.SOLVER.STEPS = []
    cfg.MODEL.ROI_HEADS.BATCH_SIZE_PER_IMAGE = 21
    cfg.MODEL.ROI_HEADS.NUM_CLASSES = 21
    cfg.MODEL.WEIGHTS = "/content/drive/MyDrive/CDD_Ai_serverV2/Damage_parts_model/model_final.pth"
    cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = 0.6
    
    return cfg
cfg_model = setup_cfg()
# สร้างโมเดล
model = build_model(cfg_model)
model.eval()

# สร้าง predictor
predictor = DefaultPredictor(cfg_model)
print("load model car part success")
def detectcarpart(image_path):
    global cfg_model, model, predictor  # เข้าถึงตัวแปร global

    # อ่านภาพ
    im = cv2.imread(image_path)

    # ทำการพยากรณ์บนภาพ
    outputs = predictor(im)
    return outputs