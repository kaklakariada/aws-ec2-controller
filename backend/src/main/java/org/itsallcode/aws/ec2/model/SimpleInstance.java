package org.itsallcode.aws.ec2.model;

import java.time.Instant;

import org.itsallcode.aws.ec2.dynamodb.DynamoDbInstance;

import com.amazonaws.services.ec2.model.Instance;
import com.amazonaws.services.ec2.model.Tag;

public class SimpleInstance
{
    private static final String NAME_TAG = "Name";

    private final String id;
    private final String name;
    private final String publicIpAddress;
    private final Instant launchTime;
    private final String state;
    private final String stateReason;
    private final String domain;
    private final DnsEntry dnsEntry;
    private final boolean controlAllowed;
    private final int sortOrder;
    private final InstancePricing pricing;

    public SimpleInstance(Instance instance, DynamoDbInstance dynamoDbInstance, DnsEntry dnsEntry,
            InstancePricing pricing)
    {
        this.pricing = pricing;
        this.id = instance.getInstanceId();
        this.name = getNameTag(instance);
        this.publicIpAddress = instance.getPublicIpAddress();
        this.domain = dynamoDbInstance != null ? dynamoDbInstance.getDomain() : null;
        controlAllowed = dynamoDbInstance != null ? dynamoDbInstance.isControlAllowed() : false;
        sortOrder = dynamoDbInstance != null ? dynamoDbInstance.getSortOrder() : Integer.MAX_VALUE;
        this.launchTime = instance.getLaunchTime().toInstant();
        this.state = instance.getState().getName();
        this.stateReason = instance.getStateTransitionReason();
        this.dnsEntry = dnsEntry;
    }

    private String getNameTag(Instance instance)
    {
        return instance.getTags().stream() //
                .filter(t -> t.getKey().equals(NAME_TAG)) //
                .map(Tag::getValue) //
                .findFirst().orElse("(missing tag '" + NAME_TAG + "')");
    }

    public String getId()
    {
        return id;
    }

    public String getName()
    {
        return name;
    }

    public String getPublicIpAddress()
    {
        return publicIpAddress;
    }

    public Instant getLaunchTime()
    {
        return launchTime;
    }

    public String getState()
    {
        return state;
    }

    public String getStateReason()
    {
        return stateReason;
    }

    public String getDomain()
    {
        return domain;
    }

    public DnsEntry getDnsEntry()
    {
        return dnsEntry;
    }

    public boolean isControlAllowed()
    {
        return controlAllowed;
    }

    public int getSortOrder()
    {
        return sortOrder;
    }

    public InstancePricing getPricing()
    {
        return pricing;
    }

    @Override
    public String toString()
    {
        return "SimpleInstance [id=" + id + ", name=" + name + ", publicIpAddress=" + publicIpAddress + ", launchTime="
                + launchTime + ", state=" + state + ", stateReason=" + stateReason + ", domain=" + domain
                + ", dnsEntry=" + dnsEntry + ", controlAllowed=" + controlAllowed + ", sortOrder=" + sortOrder
                + ", pricing=" + pricing + "]";
    }
}
