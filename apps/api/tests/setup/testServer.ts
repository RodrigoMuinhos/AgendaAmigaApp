import request from "supertest";

import { makeApp } from "../../src/app";

const app = makeApp();

export const http = () => request(app);
