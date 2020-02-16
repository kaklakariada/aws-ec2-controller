package org.itsallcode.aws.ec2.model;

import java.util.List;

public class StatusResult
{
    private List<SimpleInstance> instances;

    public StatusResult(List<SimpleInstance> instances)
    {
        this.instances = instances;
    }

    public List<SimpleInstance> getInstances()
    {
        return instances;
    }

    @Override
    public String toString()
    {
        return "StatusResult [instances=" + instances + "]";
    }

}
