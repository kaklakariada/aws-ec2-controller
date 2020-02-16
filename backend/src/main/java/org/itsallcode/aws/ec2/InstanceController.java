package org.itsallcode.aws.ec2;

import java.util.List;

import javax.inject.Inject;

import org.itsallcode.aws.ec2.model.ResultMessage;
import org.itsallcode.aws.ec2.model.SimpleInstance;
import org.itsallcode.aws.ec2.service.InstanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.ec2.model.StartInstancesResult;
import com.amazonaws.services.ec2.model.StopInstancesResult;

import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Put;
import io.micronaut.http.exceptions.HttpStatusException;

@Controller("/instances")
public class InstanceController
{
    private static final Logger LOG = LoggerFactory.getLogger(InstanceController.class);
    private InstanceService instanceService;

    @Inject
    public InstanceController(InstanceService instanceService)
    {
        this.instanceService = instanceService;
    }

    @Get("/")
    public HttpResponse<ResultMessage<List<SimpleInstance>>> listInstances()
    {
        List<SimpleInstance> result = instanceService.list();
        return HttpResponse.ok(new ResultMessage<>(result));
    }

    @Put("/{id}/state/{state}")
    public HttpResponse<ResultMessage<String>> startInstance(@PathVariable(name = "id") String id,
            @PathVariable(name = "state") String state)
    {
        LOG.debug("Setting instance {} state to {}...", id, state);
        if ("start".equals(state))
        {
            StartInstancesResult result = instanceService.start(id);
            String newState = result.getStartingInstances().isEmpty() ? null
                    : result.getStartingInstances().get(0).getCurrentState().getName();
            return HttpResponse.ok(new ResultMessage<>("Starting instance " + id + ", new state: " + newState));
        }
        if ("stop".equals(state))
        {
            StopInstancesResult result = instanceService.stop(id);
            String newState = result.getStoppingInstances().isEmpty() ? null
                    : result.getStoppingInstances().get(0).getCurrentState().getName();
            return HttpResponse.ok(new ResultMessage<>("Stopping instance " + id + ", new state: " + newState));
        }
        throw new HttpStatusException(HttpStatus.EXPECTATION_FAILED, "Unknown state '" + state + "'");
    }
}
