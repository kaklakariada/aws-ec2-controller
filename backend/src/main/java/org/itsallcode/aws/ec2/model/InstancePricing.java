package org.itsallcode.aws.ec2.model;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;

import com.amazonaws.services.ec2.model.Instance;

public class InstancePricing
{
    private Clock clock;
    private BigDecimal usDollarPerHour;
    private Instance instance;

    public InstancePricing(Instance instance, Clock clock, BigDecimal usDollarPerHour)
    {
        this.instance = instance;
        this.clock = clock;
        this.usDollarPerHour = usDollarPerHour;
    }

    public BigDecimal getUsDollarPerHour()
    {
        return usDollarPerHour;
    }

    public BigDecimal getUsDollarUntilNow()
    {
        return usDollarPerHour.multiply(BigDecimal.valueOf(getUptime().toHours()));
    }

    public Duration getUptime()
    {
        if (!instance.getState().getName().equals("runnint"))
        {
            return Duration.ZERO;
        }
        return Duration.between(instance.getLaunchTime().toInstant(), clock.instant());
    }
}
