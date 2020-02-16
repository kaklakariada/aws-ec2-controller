package org.itsallcode.aws.ec2.service;

import java.util.List;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.itsallcode.aws.ec2.dynamodb.DynamoDbInstance;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapper;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBScanExpression;

@Singleton
public class DynamoDbInstanceService
{
    private DynamoDBMapper mapper;

    @Inject
    public DynamoDbInstanceService(DynamoDBMapper mapper)
    {
        this.mapper = mapper;
    }

    public List<DynamoDbInstance> list()
    {
        return mapper.scan(DynamoDbInstance.class, new DynamoDBScanExpression());
    }

    public DynamoDbInstance getInstance(String id)
    {
        return mapper.load(DynamoDbInstance.class, id);
    }
}
