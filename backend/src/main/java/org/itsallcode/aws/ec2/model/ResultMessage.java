package org.itsallcode.aws.ec2.model;

public class ResultMessage<T>
{
    private T result;

    public ResultMessage(T result)
    {
        this.result = result;
    }

    public T getResult()
    {
        return result;
    }
}
