import { onRequestPost as __api_auth_login_ts_onRequestPost } from "G:\\1\\1\\functions\\api\\auth\\login.ts"
import { onRequestGet as __api_auth_me_ts_onRequestGet } from "G:\\1\\1\\functions\\api\\auth\\me.ts"
import { onRequestPost as __api_auth_register_ts_onRequestPost } from "G:\\1\\1\\functions\\api\\auth\\register.ts"
import { onRequestGet as __api_readings_search_ts_onRequestGet } from "G:\\1\\1\\functions\\api\\readings\\search.ts"
import { onRequestDelete as __api_readings__id__ts_onRequestDelete } from "G:\\1\\1\\functions\\api\\readings\\[id].ts"
import { onRequestGet as __api_readings__id__ts_onRequestGet } from "G:\\1\\1\\functions\\api\\readings\\[id].ts"
import { onRequestPut as __api_readings__id__ts_onRequestPut } from "G:\\1\\1\\functions\\api\\readings\\[id].ts"
import { onRequestPost as __api_interpret_ts_onRequestPost } from "G:\\1\\1\\functions\\api\\interpret.ts"
import { onRequestGet as __api_readings_index_ts_onRequestGet } from "G:\\1\\1\\functions\\api\\readings\\index.ts"
import { onRequestPost as __api_readings_index_ts_onRequestPost } from "G:\\1\\1\\functions\\api\\readings\\index.ts"
import { onRequestGet as __api_test_ts_onRequestGet } from "G:\\1\\1\\functions\\api\\test.ts"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_ts_onRequestPost],
    },
  {
      routePath: "/api/auth/me",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_me_ts_onRequestGet],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_ts_onRequestPost],
    },
  {
      routePath: "/api/readings/search",
      mountPath: "/api/readings",
      method: "GET",
      middlewares: [],
      modules: [__api_readings_search_ts_onRequestGet],
    },
  {
      routePath: "/api/readings/:id",
      mountPath: "/api/readings",
      method: "DELETE",
      middlewares: [],
      modules: [__api_readings__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/readings/:id",
      mountPath: "/api/readings",
      method: "GET",
      middlewares: [],
      modules: [__api_readings__id__ts_onRequestGet],
    },
  {
      routePath: "/api/readings/:id",
      mountPath: "/api/readings",
      method: "PUT",
      middlewares: [],
      modules: [__api_readings__id__ts_onRequestPut],
    },
  {
      routePath: "/api/interpret",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_interpret_ts_onRequestPost],
    },
  {
      routePath: "/api/readings",
      mountPath: "/api/readings",
      method: "GET",
      middlewares: [],
      modules: [__api_readings_index_ts_onRequestGet],
    },
  {
      routePath: "/api/readings",
      mountPath: "/api/readings",
      method: "POST",
      middlewares: [],
      modules: [__api_readings_index_ts_onRequestPost],
    },
  {
      routePath: "/api/test",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_test_ts_onRequestGet],
    },
  ]