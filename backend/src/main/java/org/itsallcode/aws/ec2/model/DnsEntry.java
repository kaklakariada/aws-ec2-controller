package org.itsallcode.aws.ec2.model;

import com.amazonaws.services.route53.model.ResourceRecord;
import com.amazonaws.services.route53.model.ResourceRecordSet;

public class DnsEntry
{
    private final String domain;
    private final String ip;
    private final Long ttl;

    public DnsEntry(String domain, String ip, Long ttl)
    {
        this.domain = domain;
        this.ip = ip;
        this.ttl = ttl;
    }

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

    @Override
    public String toString()
    {
        return "DnsEntry [domain=" + domain + ", ip=" + ip + ", ttl=" + ttl + "]";
    }
}
