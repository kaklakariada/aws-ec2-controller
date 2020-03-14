package org.itsallcode.aws.ec2.dynamodb;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBAttribute;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBHashKey;

public class DynamoDbInstance
{
    private String id;
    private String domain;
    private boolean controlAllowed;
    private int sortOrder;

    @DynamoDBHashKey(attributeName = "id")
    public String getId()
    {
        return id;
    }

    @DynamoDBAttribute(attributeName = "domain")
    public String getDomain()
    {
        return domain;
    }

    @DynamoDBAttribute(attributeName = "controlAllowed")
    public boolean isControlAllowed()
    {
        return controlAllowed;
    }

    @DynamoDBAttribute(attributeName = "sortOrder")
    public int getSortOrder()
    {
        return sortOrder;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public void setDomain(String domain)
    {
        this.domain = domain;
    }

    public void setControlAllowed(boolean controlAllowed)
    {
        this.controlAllowed = controlAllowed;
    }

    public void setSortOrder(int sortOrder)
    {
        this.sortOrder = sortOrder;
    }

    @Override
    public String toString()
    {
        return "DynamoDbInstance [id=" + id + ", domain=" + domain + ", stoppingAllowed=" + controlAllowed + "]";
    }
}
