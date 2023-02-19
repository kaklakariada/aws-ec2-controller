package org.itsallcode.aws.ec2.service;

import static java.util.stream.Collectors.toList;

import java.util.List;

import org.itsallcode.aws.ec2.model.DnsEntry;

import com.amazonaws.services.route53.AmazonRoute53;
import com.amazonaws.services.route53.model.ListResourceRecordSetsRequest;
import com.amazonaws.services.route53.model.ListResourceRecordSetsResult;
import com.amazonaws.services.route53.model.ResourceRecordSet;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class Route53Client
{
    private final AmazonRoute53 route53;

    @Inject
    public Route53Client(final AmazonRoute53 route53)
    {
        this.route53 = route53;
    }

    public List<DnsEntry> getDnsEntries(final String hostedZoneId)
    {
        final ListResourceRecordSetsResult result = route53
                .listResourceRecordSets(new ListResourceRecordSetsRequest().withHostedZoneId(hostedZoneId));
        if (result.isTruncated().booleanValue())
        {
            throw new IllegalStateException("Did not load all resource records");
        }
        final List<ResourceRecordSet> resourceRecordSets = result.getResourceRecordSets();
        return resourceRecordSets.stream() //
                .filter(record -> record.getType().equals("A")) //
                .map(DnsEntry::new) //
                .collect(toList());
    }
}
