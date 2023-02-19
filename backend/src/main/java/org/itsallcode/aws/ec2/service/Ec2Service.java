package org.itsallcode.aws.ec2.service;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;

import java.util.Collection;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.model.DescribeInstancesRequest;
import com.amazonaws.services.ec2.model.DescribeInstancesResult;
import com.amazonaws.services.ec2.model.Instance;
import com.amazonaws.services.ec2.model.StartInstancesRequest;
import com.amazonaws.services.ec2.model.StartInstancesResult;
import com.amazonaws.services.ec2.model.StopInstancesRequest;
import com.amazonaws.services.ec2.model.StopInstancesResult;

import io.micronaut.http.HttpStatus;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class Ec2Service
{
    private static final Logger LOG = LoggerFactory.getLogger(Ec2Service.class);

    private final AmazonEC2 ec2Client;

    private final boolean startStopAllowed;

    @Inject
    public Ec2Service(final AmazonEC2 ec2Client)
    {
        this.ec2Client = ec2Client;
        this.startStopAllowed = true;
    }

    public List<Instance> list()
    {
        return list(emptyList());
    }

    private List<Instance> list(final Collection<String> ids)
    {
        final DescribeInstancesRequest request = new DescribeInstancesRequest();
        if (!ids.isEmpty())
        {
            request.withInstanceIds(ids);
        }
        final DescribeInstancesResult instances = ec2Client.describeInstances(request);
        return instances.getReservations().stream() //
                .flatMap(res -> res.getInstances().stream()) //
                .collect(toList());
    }

    public StartInstancesResult start(final String id)
    {
        LOG.info("Starting instance {}...", id);
        if (startStopAllowed)
        {
            return ec2Client.startInstances(new StartInstancesRequest().withInstanceIds(id));
        }
        throw new HttpStatusException(HttpStatus.FORBIDDEN, "Starting this instance is not allowed");
    }

    public StopInstancesResult stop(final String id)
    {
        LOG.info("Stopping instance {}...", id);
        if (startStopAllowed)
        {
            return ec2Client.stopInstances(new StopInstancesRequest().withInstanceIds(id));
        }
        throw new HttpStatusException(HttpStatus.FORBIDDEN, "Starting this instance is not allowed");
    }
}
