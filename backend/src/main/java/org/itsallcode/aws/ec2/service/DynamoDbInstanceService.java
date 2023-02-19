package org.itsallcode.aws.ec2.service;

import java.util.List;

import org.itsallcode.aws.ec2.dynamodb.DynamoDbInstance;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;

import jakarta.inject.Inject;
import jakarta.inject.Singleton;

@Singleton
public class DynamoDbInstanceService
{
    private final DynamoDBMapper mapper;

    @Inject
    public DynamoDbInstanceService(final DynamoDBMapper mapper)
    {
        this.mapper = mapper;
    }

    public List<DynamoDbInstance> list()
    {
        return mapper.scan(DynamoDbInstance.class, new DynamoDBScanExpression());
    }

    public DynamoDbInstance getInstance(final String id)
    {
        return mapper.load(DynamoDbInstance.class, id);
    }
}
