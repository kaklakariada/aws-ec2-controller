package org.itsallcode.aws.ec2.service;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;

public class Tester
{
    public static void main(String[] args)
    {
        DynamoDbInstanceService s = new DynamoDbInstanceService(
                new DynamoDBMapper(AmazonDynamoDBClient.builder().build()));
        s.list().forEach(System.out::println);
    }
}
