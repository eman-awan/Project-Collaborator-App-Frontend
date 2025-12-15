import axios from "axios";
import { JWTStorage } from "@/secure-storage/jwt-storage";
import { ENV_CONFIG } from "@/env_config";

export const getAllUsers = async () => {
  const token = await JWTStorage.getToken();

  const res = await axios.get(`${ENV_CONFIG.API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
