import request from "supertest";

import { createApp } from "../../src/app";

const app = createApp();

export const http = () => request(app);
