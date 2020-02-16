package org.itsallcode.aws.ec2;

import java.time.Clock;

import javax.inject.Singleton;

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

import io.micronaut.context.annotation.Factory;

@Factory
public class AwsClientFactory
{
    @Singleton
    public AmazonEC2 ec2Client()
    {
        return AmazonEC2Client.builder().build();
    }

    @Singleton
    public AmazonDynamoDB dynamoDbClient()
    {
        return AmazonDynamoDBClientBuilder.standard().build();
    }

    @Singleton
    public DynamoDBMapper dynamoDbMapper(AmazonDynamoDB client, DynamoDbTableNameResolver tableNameResolver)
    {
        DynamoDBMapperConfig config = DynamoDBMapperConfig.builder().withTableNameResolver(tableNameResolver).build();
        return new DynamoDBMapper(client, config);
    }

    @Singleton
    public AmazonRoute53 route53Client()
    {
        return AmazonRoute53Client.builder().build();
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
}
