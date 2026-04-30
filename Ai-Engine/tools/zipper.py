import shutil
import os

class Zipper:
    def __call__(self, task_id):
        folder_path = os.path.join("generated_projects", task_id)
        zip_path = folder_path + ".zip"

        shutil.make_archive(folder_path, 'zip', folder_path)

        print(f"[Zipper] Created ZIP: {zip_path}")

        return zip_path