package org.itsallcode.aws.ec2.model;

public record ResultMessage<T>(T result)
{
    public T getResult()
    {
        return result;
    }
}
