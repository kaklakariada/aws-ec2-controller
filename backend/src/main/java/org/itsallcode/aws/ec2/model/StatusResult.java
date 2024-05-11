package org.itsallcode.aws.ec2.model;

import java.util.List;

public record StatusResult(List<SimpleInstance> instances)
{
    public List<SimpleInstance> getInstances()
    {
        return instances;
    }
}
