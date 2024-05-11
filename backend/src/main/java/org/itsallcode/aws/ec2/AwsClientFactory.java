package org.itsallcode.aws.ec2;

import java.time.Clock;

import org.itsallcode.aws.ec2.dynamodb.DynamoDbTableNameResolver;

import com.amazonaws.regions.Regions;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.ec2.AmazonEC2;
import com.amazonaws.services.ec2.AmazonEC2Client;
import com.amazonaws.services.pricing.AWSPricing;
import com.amazonaws.services.pricing.AWSPricingClient;
import com.amazonaws.services.route53.AmazonRoute53;
import com.amazonaws.services.route53.AmazonRoute53Client;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micronaut.context.annotation.Factory;
import io.micronaut.context.env.Environment;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;

@Factory
public class AwsClientFactory
{
    private final Environment env;

    @Inject
    public AwsClientFactory(final Environment env)
    {
        this.env = env;
    }

    private String getRegion()
    {
        return getEnvValue("deployment.aws.region");
    }

    private String getEnvValue(final String name)
    {
        return env.get(name, String.class).orElseThrow(
                () -> new IllegalArgumentException("Region not found in environment using property '" + name + "'"));
    }
    @Singleton
    public AmazonEC2 ec2Client()
    {
        return AmazonEC2Client.builder().withRegion(getRegion()).build();
    }

    @Singleton
    public AmazonDynamoDB dynamoDbClient()
    {
        return AmazonDynamoDBClientBuilder.standard().withRegion(getRegion()).build();
    }

    @Singleton
    public DynamoDBMapper dynamoDbMapper(final AmazonDynamoDB client, final DynamoDbTableNameResolver tableNameResolver)
    {
        final DynamoDBMapperConfig config = DynamoDBMapperConfig.builder().withTableNameResolver(tableNameResolver)
                .build();
        return new DynamoDBMapper(client, config);
    }

    @Singleton
    public AmazonRoute53 route53Client()
    {
        return AmazonRoute53Client.builder().withRegion(getRegion()).build();
    }

    @Singleton
    public AWSPricing pricingClient()
    {
        return AWSPricingClient.builder().withRegion(Regions.US_EAST_1).build();
    }

    @Singleton
    public Clock clock()
    {
        return Clock.systemUTC();
    }

    @Singleton
    @Named("aws")
    public ObjectMapper jacksonObjectMapper()
    {
        return new ObjectMapper();
    }
}
