import axios from "axios";
import { env } from "../core/config/env";

export const api = axios.create({
  baseURL: env.apiHttpBase || "/api",
  withCredentials: false,
});
