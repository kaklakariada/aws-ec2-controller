package org.itsallcode.aws.ec2.model;

import com.amazonaws.services.route53.model.ResourceRecord;
import com.amazonaws.services.route53.model.ResourceRecordSet;

public record DnsEntry(String domain, String ip, Long ttl)
{
    public DnsEntry(ResourceRecordSet recordSet)
    {
        this(recordSet.getName().substring(0, recordSet.getName().length() - 1),
                recordSet.getResourceRecords().stream().map(ResourceRecord::getValue).findFirst().orElse(null),
                recordSet.getTTL());
    }

    public String getDomain()
    {
        return domain;
    }

    public String getIp()
    {
        return ip;
    }

    public Long getTtl()
    {
        return ttl;
    }
}
