package org.itsallcode.aws.ec2.dynamodb;

import javax.inject.Inject;
import javax.inject.Singleton;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig;
import com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBMapperConfig.TableNameResolver;

import io.micronaut.context.env.Environment;
import io.micronaut.core.type.Argument;

@Singleton
public class DynamoDbTableNameResolver implements TableNameResolver
{
    private static final Logger LOG = LoggerFactory.getLogger(DynamoDbTableNameResolver.class);

    private Environment env;

    @Inject
    public DynamoDbTableNameResolver(Environment env)
    {
        this.env = env;
    }

    @Override
    public String getTableName(Class<?> clazz, DynamoDBMapperConfig config)
    {
        String configProperty = "tablename." + clazz.getSimpleName().toLowerCase();
        String tableName = env.get(configProperty, Argument.of(String.class))
                .orElseThrow(() -> new IllegalArgumentException("Tablename for class " + clazz.getSimpleName()
                        + " not found in environment using property " + configProperty));
        LOG.debug("Got table {} for class {} from env property {}", tableName, clazz.getSimpleName(), configProperty);
        return tableName;
    }
}
