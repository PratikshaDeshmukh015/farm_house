package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DemoApplicationTests {

	private static final String FRONTEND_ORIGIN = "https://farm-house-wine.vercel.app";

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void loginPreflightAllowsFrontendOriginAndCredentials() throws Exception {
		mockMvc.perform(options("/api/auth/login")
				.header("Origin", FRONTEND_ORIGIN)
				.header("Access-Control-Request-Method", "POST")
				.header("Access-Control-Request-Headers", "content-type,requester-id"))
			.andExpect(status().isOk())
			.andExpect(header().string("Access-Control-Allow-Origin", FRONTEND_ORIGIN))
			.andExpect(header().string("Access-Control-Allow-Credentials", "true"))
			.andExpect(header().string("Access-Control-Allow-Methods", containsString("POST")));
	}

	@Test
	void loginRouteIsReachableWithoutCsrfToken() throws Exception {
		mockMvc.perform(post("/api/auth/login")
				.header("Origin", FRONTEND_ORIGIN)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"email\":\"missing-user@example.invalid\",\"password\":\"invalid\"}"))
			.andExpect(header().string("Access-Control-Allow-Origin", FRONTEND_ORIGIN))
			.andExpect(status().isUnauthorized());
	}
}
