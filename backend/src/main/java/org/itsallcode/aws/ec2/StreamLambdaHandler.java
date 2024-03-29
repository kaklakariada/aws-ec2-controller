package org.itsallcode.aws.ec2;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.serverless.exceptions.ContainerInitializationException;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestStreamHandler;

import io.micronaut.context.ApplicationContext;
import io.micronaut.function.aws.proxy.MicronautLambdaContainerHandler;

@SuppressWarnings("squid:S2139") // Logging and rethrowing exceptions is OK here
public class StreamLambdaHandler implements RequestStreamHandler
{
    private static final Logger LOG = LoggerFactory.getLogger(StreamLambdaHandler.class);

    private final MicronautLambdaContainerHandler handler;

    public StreamLambdaHandler()
    {
        LOG.info("Creating micronaut lambda container handler");
        try
        {
            handler = new MicronautLambdaContainerHandler();
        }
        catch (ContainerInitializationException e)
        {
            // if we fail here. We re-throw the exception to force another cold
            // start
            LOG.error("Could not initialize Micronaut", e);
            throw new IllegalStateException("Could not initialize Micronaut", e);
        }
    }

    ApplicationContext getApplicationContext()
    {
        return handler.getApplicationContext();
    }

    @Override
    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException
    {
        LOG.info("Handle request");
        try
        {
            handler.proxyStream(inputStream, outputStream, context);
        }
        catch (Exception e)
        {
            LOG.error("Request failed", e);
        }
    }
}
