package org.itsallcode.aws.ec2.service;

import static java.util.Arrays.asList;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.services.pricing.AWSPricing;
import com.amazonaws.services.pricing.model.Filter;
import com.amazonaws.services.pricing.model.FilterType;
import com.amazonaws.services.pricing.model.GetProductsRequest;
import com.amazonaws.services.pricing.model.GetProductsResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.micronaut.cache.annotation.Cacheable;

public class PricingService
{
    private static final Logger LOG = LoggerFactory.getLogger(PricingService.class);

    private final boolean ENABLED = false;

    private AWSPricing pricing;
    private ObjectMapper objectMapper;
    private DecimalFormat decimalFormat;

    @Inject
    public PricingService(AWSPricing pricing, ObjectMapper objectMapper)
    {
        this.pricing = pricing;
        this.objectMapper = objectMapper;
        decimalFormat = createDecimalFormat();
    }

    @Cacheable
    public Optional<BigDecimal> getPriceInUsDollarPerHour(String location, String instanceType)
    {
        if (!ENABLED)
        {
            return Optional.empty();
        }
        List<Filter> filters = buildFilter(location, instanceType);
        LOG.debug("Get products for filter {}", filters);
        String priceListString = getPriceListString(filters);
        JsonNode priceList = parse(priceListString);
        String usDollarPerHourString = extractPricePerHour(priceList);
        BigDecimal usDollarPerHour = parseBigDecimal(usDollarPerHourString);
        LOG.debug("Got price {} per hour for instance type {}", usDollarPerHour, instanceType);
        return Optional.of(usDollarPerHour);
    }

    private String getPriceListString(List<Filter> filters)
    {
        GetProductsResult products = pricing.getProducts(getProductRequest(filters));
        if (products.getPriceList().size() != 1)
        {
            throw new IllegalStateException("Expected one price list entry but got " + products.getPriceList().size()
                    + " for filters " + filters + ": " + products.getPriceList());
        }
        return products.getPriceList().get(0);
    }

    private GetProductsRequest getProductRequest(List<Filter> filters)
    {
        return new GetProductsRequest().withServiceCode("AmazonEC2").withFilters(filters);
    }

    private List<Filter> buildFilter(String location, String instanceType)
    {
        return asList(filter("location", location), //
                filter("instanceType", instanceType), //
                filter("operatingSystem", "Linux"), //
                filter("capacitystatus", "Used"), //
                filter("operation", "RunInstances"));
    }

    private String extractPricePerHour(JsonNode readTree)
    {
        JsonNode onDemand = readTree.get("terms").get("OnDemand");
        if (onDemand.size() != 1)
        {
            throw new IllegalStateException("Expected one OnDemand pricing, found " + onDemand);
        }

        String onDemandField = onDemand.fieldNames().next();
        JsonNode price = onDemand.get(onDemandField);
        JsonNode priceDimensions = price.get("priceDimensions");
        assert priceDimensions.size() == 1;
        if (priceDimensions.size() != 1)
        {
            throw new IllegalStateException("Expected one price dimension, found " + priceDimensions);
        }
        JsonNode firstPrice = priceDimensions.get(priceDimensions.fieldNames().next());
        String unit = firstPrice.get("unit").asText();
        if (!unit.equals("Hrs"))
        {
            throw new IllegalStateException("Expected unit Hrs but got " + unit);
        }

        return firstPrice.get("pricePerUnit").get("USD").asText();
    }

    private BigDecimal parseBigDecimal(String usDollarPerHour)
    {
        try
        {
            return (BigDecimal) decimalFormat.parse(usDollarPerHour);
        }
        catch (ParseException e)
        {
            throw new IllegalStateException("Error parsing big decimal " + usDollarPerHour);
        }
    }

    private static DecimalFormat createDecimalFormat()
    {
        DecimalFormat nf = (DecimalFormat) NumberFormat.getInstance(Locale.US);
        nf.setParseBigDecimal(true);
        return nf;
    }

    private JsonNode parse(String json)
    {
        try
        {
            return objectMapper.readTree(json);
        }
        catch (IOException e)
        {
            throw new IllegalStateException("Error parsing json " + json, e);
        }
    }

    private Filter filter(String field, String value)
    {
        return new Filter().withType(FilterType.TERM_MATCH).withField(field).withValue(value);
    }
}
