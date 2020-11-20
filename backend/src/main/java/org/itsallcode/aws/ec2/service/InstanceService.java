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

import javax.inject.Inject;

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
    public InstanceService(Ec2Service ec2Service, DynamoDbInstanceService dynamoDbInstanceService,
            Route53Client route53Client, PricingService pricingService, Clock clock, Environment env)
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
        Map<String, DynamoDbInstance> instances = getDynamoDbInstances().stream()
                .collect(toMap(DynamoDbInstance::getId, Function.identity()));

        List<Instance> ec2Instances = ec2Service.list();

        Map<String, DnsEntry> dnsEntries = route53Client.getDnsEntries(getHostedZoneId()).stream()
                .collect(toMap(DnsEntry::getDomain, Function.identity()));

        LOG.info("Found {} dynamodb entries, {} instances and {} DNS entries", instances.size(), ec2Instances.size(),
                dnsEntries.size());

        List<SimpleInstance> simpleInstances = ec2Instances.stream()
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

    private SimpleInstance createInstance(Map<String, DynamoDbInstance> instances, Map<String, DnsEntry> dnsEntries,
            Instance instance)
    {
        String id = instance.getInstanceId();
        DynamoDbInstance dynamoDbInstance = instances.get(id);
        String domain = dynamoDbInstance != null ? dynamoDbInstance.getDomain() : null;
        DnsEntry dnsEntry = domain != null ? dnsEntries.get(domain) : null;
        Optional<BigDecimal> usDollarPerHour = pricingService.getPriceInUsDollarPerHour("EU (Ireland)",
                instance.getInstanceType());
        Optional<InstancePricing> pricing = usDollarPerHour.map(price -> new InstancePricing(instance, clock, price));
        SimpleInstance simpleInstance = new SimpleInstance(instance, dynamoDbInstance, dnsEntry, pricing.orElse(null));
        LOG.info("Found instance {}", simpleInstance);
        return simpleInstance;
    }

    private List<DynamoDbInstance> getDynamoDbInstances()
    {
        return dynamoDbInstanceService.list();
    }

    public StartInstancesResult start(String id)
    {
        assertInstanceWhitelisted(id);
        return ec2Service.start(id);
    }

    public StopInstancesResult stop(String id)
    {
        assertInstanceWhitelisted(id);
        return ec2Service.stop(id);
    }

    private void assertInstanceWhitelisted(String id)
    {
        DynamoDbInstance instance = dynamoDbInstanceService.getInstance(id);
        boolean whitelisted = instance == null ? false : instance.isControlAllowed();
        if (!whitelisted)
        {
            throw new HttpStatusException(HttpStatus.FORBIDDEN, "Controlling instance " + id + " is not allowed");
        }
    }
}
