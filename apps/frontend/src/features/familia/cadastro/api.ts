import axios from "axios";
import type {
  AttachmentUploadResult,
  AvatarUploadResult,
  ChildProfile,
  ChildProfileCreateDTO,
} from "./types";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10_000,
});

const simulatedFamilies: ChildProfile[] = [];

const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const wait = (min = 300, max = 600) => new Promise((resolve) => setTimeout(resolve, randomBetween(min, max)));

const generateId = () =>
  (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `fam-${Math.random().toString(36).slice(2, 11)}`);

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function createFamilyProfile(payload: ChildProfileCreateDTO): Promise<ChildProfile> {
  try {
    const response = await apiClient.post<{ id: string }>("/familiares", payload);
    const record: ChildProfile = { ...payload, id: response.data.id };
    return record;
  } catch (error) {
    console.warn("Usando stub createFamilyProfile", error);
    await wait();
    const record: ChildProfile = { ...payload, id: generateId() };
    simulatedFamilies.unshift(record);
    return record;
  }
}

export async function uploadAvatar(file: File): Promise<AvatarUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post<AvatarUploadResult>("/uploads/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.warn("Usando stub uploadAvatar", error);
    await wait();
    const url = await readFileAsDataUrl(file);
    return { url };
  }
}

export async function uploadAttachment(file: File): Promise<AttachmentUploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await apiClient.post<AttachmentUploadResult>("/uploads/anexo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.warn("Usando stub uploadAttachment", error);
    await wait();
    const url = await readFileAsDataUrl(file);
    return { url, name: file.name, size: file.size };
  }
}

export async function listFamilies(): Promise<ChildProfile[]> {
  try {
    const response = await apiClient.get<ChildProfile[]>("/familiares");
    return response.data;
  } catch (error) {
    console.warn("Usando stub listFamilies", error);
    await wait();
    return simulatedFamilies.slice();
  }
}
