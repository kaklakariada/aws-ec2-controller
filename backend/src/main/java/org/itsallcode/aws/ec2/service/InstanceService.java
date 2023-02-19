package org.itsallcode.aws.ec2.service;

import static java.util.stream.Collectors.toList;
import static java.util.stream.Collectors.toMap;

import java.math.BigDecimal;
import java.time.Clock;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

import org.itsallcode.aws.ec2.dynamodb.DynamoDbInstance;
import org.itsallcode.aws.ec2.model.DnsEntry;
import org.itsallcode.aws.ec2.model.InstancePricing;
import org.itsallcode.aws.ec2.model.SimpleInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.ec2.model.Instance;
import com.amazonaws.services.ec2.model.StartInstancesResult;
import com.amazonaws.services.ec2.model.StopInstancesResult;

import io.micronaut.context.env.Environment;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.exceptions.HttpStatusException;
import jakarta.inject.Inject;

public class InstanceService
{
    private static final String HOSTED_ZONE_ID_PROPERTY = "hosted.zone.id";

    private static final Logger LOG = LoggerFactory.getLogger(InstanceService.class);

    private final Ec2Service ec2Service;
    private final DynamoDbInstanceService dynamoDbInstanceService;
    private final Route53Client route53Client;
    private final PricingService pricingService;
    private final Clock clock;
    private final Environment env;

    @Inject
    public InstanceService(final Ec2Service ec2Service, final DynamoDbInstanceService dynamoDbInstanceService,
            final Route53Client route53Client, final PricingService pricingService, final Clock clock,
            final Environment env)
    {
        this.ec2Service = ec2Service;
        this.dynamoDbInstanceService = dynamoDbInstanceService;
        this.route53Client = route53Client;
        this.pricingService = pricingService;
        this.clock = clock;
        this.env = env;
    }

    public List<SimpleInstance> list()
    {
        final Map<String, DynamoDbInstance> instances = getDynamoDbInstances().stream()
                .collect(toMap(DynamoDbInstance::getId, Function.identity()));

        final List<Instance> ec2Instances = ec2Service.list();

        final Map<String, DnsEntry> dnsEntries = route53Client.getDnsEntries(getHostedZoneId()).stream()
                .collect(toMap(DnsEntry::getDomain, Function.identity()));

        LOG.info("Found {} dynamodb entries, {} instances and {} DNS entries", instances.size(), ec2Instances.size(),
                dnsEntries.size());

        final List<SimpleInstance> simpleInstances = ec2Instances.stream()
                .map(instance -> createInstance(instances, dnsEntries, instance))
                .sorted(Comparator.comparing(SimpleInstance::getSortOrder)) //
                .collect(toList());

        LOG.info("Collected {} simple instances", simpleInstances.size());

        return simpleInstances;
    }

    private String getHostedZoneId()
    {
        return env.get(HOSTED_ZONE_ID_PROPERTY, String.class).orElseThrow(() -> new IllegalStateException(
                "Hosted zone id not configured as property '" + HOSTED_ZONE_ID_PROPERTY + "'"));
    }

    private SimpleInstance createInstance(final Map<String, DynamoDbInstance> instances,
            final Map<String, DnsEntry> dnsEntries,
            final Instance instance)
    {
        final String id = instance.getInstanceId();
        final DynamoDbInstance dynamoDbInstance = instances.get(id);
        final String domain = dynamoDbInstance != null ? dynamoDbInstance.getDomain() : null;
        final DnsEntry dnsEntry = domain != null ? dnsEntries.get(domain) : null;
        final Optional<BigDecimal> usDollarPerHour = pricingService.getPriceInUsDollarPerHour("EU (Ireland)",
                instance.getInstanceType());
        final Optional<InstancePricing> pricing = usDollarPerHour
                .map(price -> new InstancePricing(instance, clock, price));
        final SimpleInstance simpleInstance = new SimpleInstance(instance, dynamoDbInstance, dnsEntry,
                pricing.orElse(null));
        LOG.info("Found instance {}", simpleInstance);
        return simpleInstance;
    }

    private List<DynamoDbInstance> getDynamoDbInstances()
    {
        return dynamoDbInstanceService.list();
    }

    public StartInstancesResult start(final String id)
    {
        assertInstanceWhitelisted(id);
        return ec2Service.start(id);
    }

    public StopInstancesResult stop(final String id)
    {
        assertInstanceWhitelisted(id);
        return ec2Service.stop(id);
    }

    private void assertInstanceWhitelisted(final String id)
    {
        final DynamoDbInstance instance = dynamoDbInstanceService.getInstance(id);
        final boolean whitelisted = instance == null ? false : instance.isControlAllowed();
        if (!whitelisted)
        {
            throw new HttpStatusException(HttpStatus.FORBIDDEN, "Controlling instance " + id + " is not allowed");
        }
    }
}
