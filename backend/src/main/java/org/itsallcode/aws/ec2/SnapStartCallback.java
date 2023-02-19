package org.itsallcode.aws.ec2;

import java.util.List;

import org.crac.Context;
import org.crac.Resource;
import org.itsallcode.aws.ec2.model.SimpleInstance;
import org.itsallcode.aws.ec2.service.InstanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.micronaut.crac.OrderedResource;
import jakarta.inject.Inject;

public class SnapStartCallback implements OrderedResource
{
    private static final Logger LOG = LoggerFactory.getLogger(SnapStartCallback.class);

    private final InstanceService instanceService;

    @Inject
    public SnapStartCallback(final InstanceService instanceService)
    {
        this.instanceService = instanceService;
    }

    @Override
    public void beforeCheckpoint(final Context<? extends Resource> context)
    {
        LOG.info("Before checkpoint");
        try
        {
            final List<SimpleInstance> instances = instanceService.list();
            LOG.info("Found {} instances", instances.size());
        }
        catch (final Exception e)
        {
            LOG.warn("Failed to initialize lambda", e);
        }
    }

    @Override
    public void afterRestore(final Context<? extends Resource> context)
    {
        LOG.info("After restore");
    }
}
