package org.itsallcode.aws.ec2;

import org.itsallcode.aws.ec2.model.ResultMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Produces;
import io.micronaut.http.exceptions.HttpStatusException;
import io.micronaut.http.server.exceptions.ExceptionHandler;
import jakarta.inject.Singleton;

@Produces
@Singleton
public class GlobalExceptionHandler implements ExceptionHandler<Exception, HttpResponse<ResultMessage<String>>>
{
    private static final Logger LOG = LoggerFactory.getLogger(InstanceController.class);

    @Override
    public HttpResponse<ResultMessage<String>> handle(@SuppressWarnings("rawtypes") final HttpRequest request,
            final Exception exception)
    {
        LOG.error("Error processing request {}: {}", request, exception, exception);

        if (exception instanceof HttpStatusException)
        {
            final HttpStatus status = ((HttpStatusException) exception).getStatus();
            return HttpResponse.status(status, exception.getMessage());
        }
        return HttpResponse.serverError(new ResultMessage<>(exception.toString()));
    }
}
