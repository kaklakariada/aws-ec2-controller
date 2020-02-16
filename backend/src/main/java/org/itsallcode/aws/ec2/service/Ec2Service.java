package org.itsallcode.aws.ec2.service;

import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;

import java.util.Collection;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.itsallcode.aws.ec2.InstanceController;
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

@Singleton
public class Ec2Service
{
    private static final Logger LOG = LoggerFactory.getLogger(InstanceController.class);

    private AmazonEC2 ec2Client;

    @Inject
    public Ec2Service(AmazonEC2 ec2Client)
    {
        this.ec2Client = ec2Client;
    }

    public List<Instance> list()
    {
        return list(emptyList());
    }

    private List<Instance> list(Collection<String> ids)
    {
        DescribeInstancesRequest request = new DescribeInstancesRequest();
        if (!ids.isEmpty())
        {
            request.withInstanceIds(ids);
        }
        DescribeInstancesResult instances = ec2Client.describeInstances(request);
        return instances.getReservations().stream() //
                .flatMap(res -> res.getInstances().stream()) //
                .collect(toList());
    }

    public StartInstancesResult start(String id)
    {
        LOG.info("Starting instance {}...", id);
        return ec2Client.startInstances(new StartInstancesRequest().withInstanceIds(id));
    }

    public StopInstancesResult stop(String id)
    {
        LOG.info("Stopping instance {}...", id);
        return ec2Client.stopInstances(new StopInstancesRequest().withInstanceIds(id));
    }

}
