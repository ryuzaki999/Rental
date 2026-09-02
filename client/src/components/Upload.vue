<template>
  <div class="upload-card">
    <label class="upload-label">{{ label }}</label>

    <div class="upload-input-wrapper">
      <input id="upload-input" type="file" class="upload-input" @change="onFileChange" />
      <label for="upload-input" class="upload-button">
        เลือกไฟล์
      </label>
      <span v-if="filename" class="upload-filename">
        {{ filename }}
      </span>
    </div>

    <p v-if="uploading" class="upload-status">กำลังอัปโหลด...</p>

    <div v-if="uploadedPath" class="upload-preview">
      <img :src="uploadedPath" alt="uploaded" class="upload-image" />
      <div class="upload-success">อัปโหลดเสร็จสมบูรณ์</div>
    </div>
  </div>
</template>

<script>
import FieldService from '@/services/FieldService';

export default {
  props: {
    label: {
      type: String,
      default: 'Upload Image:'
    }
  },
  data () {
    return {
      uploading: false,
      filename: '',
      uploadedPath: ''
    }
  },
  methods: {
    async onFileChange (e) {
      const file = e.target.files[0]
      if (!file) return
      this.filename = file.name
      const formData = new FormData()
      formData.append('image', file)
      this.uploading = true
      try {
        const res = await FieldService.upload(formData)
        // store local preview + emit the returned image path
        this.uploadedPath = res.data.image
        this.$emit('uploaded', res.data.image)
      } catch (err) {
        console.error(err)
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>

<style scoped>
.upload-card {
  border-radius: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  text-align: left;
}

.upload-label {
  display: block;
  margin-bottom: 0.6rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.upload-input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.upload-input {
  display: none;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 1.25rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #059669, #16a34a);
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(5, 150, 105, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.upload-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(5, 150, 105, 0.3);
  background: linear-gradient(135deg, #047857, #16a34a);
}

.upload-button:active {
  transform: translateY(0);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.22);
}

.upload-filename {
  font-size: 0.8rem;
  color: #4b5563;
}

.upload-status {
  margin-top: 0.6rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.upload-preview {
  margin-top: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.upload-image {
  width: 180px;
  height: 180px;
  object-fit: cover;
  border-radius: 0.9rem;
  border: 1px solid #e5e7eb;
}

.upload-success {
  font-size: 0.8rem;
  color: #059669;
  font-weight: 600;
}
</style>
