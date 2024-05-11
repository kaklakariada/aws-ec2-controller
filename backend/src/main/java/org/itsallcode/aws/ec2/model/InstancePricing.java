package org.itsallcode.aws.ec2.model;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;

import com.amazonaws.services.ec2.model.Instance;

public record InstancePricing(Instance instance, Clock clock, BigDecimal usDollarPerHour)
{
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
