package org.itsallcode.aws.ec2;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.amazonaws.serverless.proxy.internal.testutils.AwsProxyRequestBuilder;
import com.amazonaws.serverless.proxy.internal.testutils.MockLambdaContext;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

class StreamLambdaHandlerTest
{
    private StreamLambdaHandler handler;
    private MockLambdaContext context;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp()
    {
        handler = new StreamLambdaHandler();
        context = new MockLambdaContext();
        objectMapper = new ObjectMapper();
    }

    @Test
    void emptyRequest_returns502() throws IOException
    {
        JsonNode response = handleRequest("");
        assertEquals(502, response.get("statusCode").asInt());
        assertEquals("{\"message\":\"Gateway timeout\"}", response.get("body").textValue());
    }

    @Test
    void resourceNotFound() throws IOException
    {
        AwsProxyRequestBuilder request = new AwsProxyRequestBuilder("/unknown", "GET");
        assertEquals(404, handleRequest(request).get("statusCode").asInt());
    }

    @Test
    void listInstances_failsWithMissingDynamoDbProperty() throws IOException
    {
        AwsProxyRequestBuilder request = new AwsProxyRequestBuilder("/instances", "GET");

        JsonNode response = handleRequest(request);
        assertEquals(500, response.get("statusCode").asInt());
        assertEquals(
                "{\"result\":\"java.lang.IllegalArgumentException: Tablename for class DynamoDbInstance not found in environment using property tablename.dynamodbinstance\"}",
                response.get("body").textValue());
    }

    private JsonNode handleRequest(String input) throws IOException
    {
        ByteArrayInputStream inputStream = new ByteArrayInputStream(input.getBytes(StandardCharsets.UTF_8));
        return handleRequest(inputStream);
    }

    private JsonNode handleRequest(AwsProxyRequestBuilder requestBuilder) throws IOException
    {
        return handleRequest(requestBuilder.buildStream());
    }

    private JsonNode handleRequest(InputStream inputStream) throws IOException
    {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        handler.handleRequest(inputStream, outputStream, context);
        return objectMapper.readTree(outputStream.toByteArray());
    }
}
